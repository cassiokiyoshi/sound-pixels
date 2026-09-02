const canvas = document.querySelector<HTMLCanvasElement>("#pixel-canvas")!;
const context = canvas.getContext("2d")!;
const microphoneButton = document.querySelector<HTMLButtonElement>("#microphone-button")!;
const sensitivityInput = document.querySelector<HTMLInputElement>("#sensitivity")!;
const statusElement = document.querySelector<HTMLElement>("#audio-status")!;

const COLUMNS = 24;
const ROWS = 16;
const GAP = 3;

let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let stream: MediaStream | null = null;
let frequencyData: Uint8Array<ArrayBuffer> | null = null;
let previousEnergy = 0;
let glitch = 0;

function drawIdle(time: number): void {
  context.fillStyle = "#030303";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const cellWidth = canvas.width / COLUMNS;
  const cellHeight = canvas.height / ROWS;

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLUMNS; x += 1) {
      const pulse = (Math.sin(time * 0.0015 + x * 0.45 + y * 0.3) + 1) / 2;
      context.fillStyle = `hsla(${185 + x * 2}, 80%, 55%, ${0.05 + pulse * 0.12})`;
      context.fillRect(x * cellWidth + GAP, y * cellHeight + GAP, cellWidth - GAP, cellHeight - GAP);
    }
  }
}

function drawAudio(): void {
  if (!analyser || !frequencyData) return;

  analyser.getByteFrequencyData(frequencyData);
  const sensitivity = Number(sensitivityInput.value);
  const energy = frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length / 255;

  if (energy > previousEnergy * 1.35 && energy > 0.18) glitch = 1;
  previousEnergy = previousEnergy * 0.8 + energy * 0.2;
  glitch *= 0.82;

  context.fillStyle = glitch > 0.2 ? `rgb(${Math.floor(glitch * 28)} 0 ${Math.floor(glitch * 35)})` : "#030303";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const cellWidth = canvas.width / COLUMNS;
  const cellHeight = canvas.height / ROWS;

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLUMNS; x += 1) {
      const progress = x / (COLUMNS - 1);
      const bin = Math.floor(progress * (frequencyData.length - 1));
      const strength = Math.min(1, (frequencyData[bin] / 255) * sensitivity);
      const verticalFade = 1 - Math.abs(y - ROWS / 2) / (ROWS / 2);
      const lit = strength > 1 - verticalFade;
      const offset = glitch > 0.25 && Math.random() < glitch * 0.18 ? Math.round((Math.random() - 0.5) * 5) : 0;
      const hue = 190 + progress * 150;

      context.fillStyle = lit
        ? `hsl(${hue + glitch * 80} 95% ${55 + strength * 18}%)`
        : `hsla(${hue} 70% 35% / ${0.05 + strength * 0.15})`;

      context.fillRect((x + offset) * cellWidth + GAP, y * cellHeight + GAP, cellWidth - GAP, cellHeight - GAP);
    }
  }
}

function animate(time: number): void {
  if (analyser) drawAudio();
  else drawIdle(time);
  requestAnimationFrame(animate);
}

async function startMicrophone(): Promise<void> {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
    audioContext.createMediaStreamSource(stream).connect(analyser);

    microphoneButton.textContent = "Stop microphone";
    statusElement.textContent = "Listening · audio stays in your browser";
  } catch (error) {
    console.error(error);
    statusElement.textContent = "Microphone access was unavailable";
  }
}

function stopMicrophone(): void {
  stream?.getTracks().forEach((track) => track.stop());
  void audioContext?.close();
  stream = null;
  audioContext = null;
  analyser = null;
  frequencyData = null;
  microphoneButton.textContent = "Start microphone";
  statusElement.textContent = "Microphone is off";
}

microphoneButton.addEventListener("click", () => {
  if (analyser) stopMicrophone();
  else void startMicrophone();
});

requestAnimationFrame(animate);
