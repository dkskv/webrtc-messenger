export interface SignalPayload {
  description: RTCSessionDescription;
  candidates: RTCIceCandidateInit[];
}

export class WebRTCConnection {
  /** Основной объект WebRTC соединения */
  private readonly peerConnection: RTCPeerConnection;
  /** Канал для обмена данными (null до получения или создания) */
  private dataChannel: RTCDataChannel | null = null;
  /** Callback'и, ожидающие dataChannel */
  private readonly dataChannelAwaiters = new Set<
    (channel: RTCDataChannel) => void
  >();
  private candidates: RTCIceCandidateInit[] = [];

  constructor() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
  }

  /** Отправить сообщение */
  sendMessage(message: string) {
    if (!this.dataChannel) {
      throw new Error("Missing data channel");
    }

    if (this.dataChannel.readyState !== "open") {
      throw new Error("Data channel is not open");
    }

    this.dataChannel.send(message);
  }

  /** Инициировать соединение и вернуть payload для передачи собеседнику */
  async initiate(): Promise<void> {
    // Инициация канала данных
    this.setupDataChannel(this.peerConnection.createDataChannel("chat"));

    const description = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(description);
    this.candidates = await this.gatherIceCandidates();
  }

  /** Подготовиться к принятию соединения и вернуть payload для передачи собеседнику */
  async accept(): Promise<void> {
    // Ожидание канала данных, инициированного собеседником
    this.peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };

    const description = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(description);
    this.candidates = await this.gatherIceCandidates();
  }

  get localDescription() {
    return this.peerConnection.localDescription;
  }

  get signalPayload(): SignalPayload {
    const description = this.localDescription;

    if (!description) {
      throw new Error("Missing local description");
    }

    return { description, candidates: this.candidates };
  }

  /** Добавление в соединение информации о собеседнике */
  async applyRemoteSignal(payload: SignalPayload) {
    if (
      (payload.description.type === "offer" && this.dataChannel) ||
      (payload.description.type === "answer" && !this.dataChannel)
    ) {
      throw new Error("Invalid description type");
    }

    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(payload.description)
    );

    for (const c of payload.candidates) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(c));
    }
  }

  awaitDataChannel(f: (channel: RTCDataChannel) => void): () => void {
    if (this.dataChannel) {
      f(this.dataChannel);

      return () => {};
    }

    this.dataChannelAwaiters.add(f);

    return () => this.dataChannelAwaiters.delete(f);
  }

  awaitDataChannelOpen(onOpen: () => void): () => void {
    const openEventController = new AbortController();

    const disposeChannelAwaiting = this.awaitDataChannel((channel) => {
      channel.addEventListener("open", () => onOpen(), {
        signal: openEventController.signal,
      });
    });

    return () => {
      disposeChannelAwaiting();
      openEventController.abort();
    };
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;

    this.dataChannelAwaiters.forEach((f) => {
      f(channel);
    });

    this.dataChannelAwaiters.clear();
  }

  /** Ожидание завершения сбора ICE-кандидатов (начинается после setLocalDescription) */
  private async gatherIceCandidates(): Promise<RTCIceCandidateInit[]> {
    /** ICE-кандидаты - возможные маршруты для P2P-соединения (например, IP-адрес + порт) */
    const candidates: RTCIceCandidateInit[] = [];

    const handleCandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        candidates.push(event.candidate.toJSON());
      }
    };

    this.peerConnection.addEventListener("icecandidate", handleCandidate);
    await this.waitForIceGathering();
    this.peerConnection.removeEventListener("icecandidate", handleCandidate);

    return candidates;
  }

  private async waitForIceGathering(): Promise<void> {
    if (this.peerConnection.iceGatheringState === "complete") {
      return;
    }

    return new Promise<void>((resolve) => {
      const controller = new AbortController();

      this.peerConnection.addEventListener(
        "icegatheringstatechange",
        () => {
          if (this.peerConnection.iceGatheringState === "complete") {
            controller.abort();
            resolve();
          }
        },
        { signal: controller.signal }
      );
    });
  }

  /** Завершить соединение и очистить ресурсы */
  destroy() {
    if (this.dataChannel) {
      try {
        this.dataChannel.close();
      } catch (e) {
        console.error(e);
      } finally {
        this.dataChannelAwaiters.clear();
        this.dataChannel = null;
      }
    }

    try {
      this.peerConnection.close();
    } catch (e) {
      console.error(e);
    } finally {
      this.peerConnection.ondatachannel = null;
    }
  }
}
