import { useEffect, useRef } from 'react'


type VoiceVisualizerProps = {
  isListening: boolean
  onMicrophoneError: () => void
}


const BAR_IDLE_HEIGHTS = [
  28, 46, 68, 92, 116, 92, 68, 46, 28,
]
const BAR_FREQUENCY_BINS = [
  12, 9, 6, 4, 2, 4, 6, 9, 12,
]
const VISUALIZER_HEIGHT = 128


function VoiceVisualizer({
  isListening,
  onMicrophoneError,
}: VoiceVisualizerProps) {
  const visualizerRef = useRef<HTMLDivElement | null>(null)
  const orbRef = useRef<HTMLDivElement | null>(null)
  const barRefs = useRef<Array<SVGRectElement | null>>([])

  useEffect(() => {
    if (!isListening) {
      barRefs.current.forEach((bar, index) => {
        if (bar) {
          const idleHeight = BAR_IDLE_HEIGHTS[index]
          bar.setAttribute('height', String(idleHeight))
          bar.setAttribute(
            'y',
            String((VISUALIZER_HEIGHT - idleHeight) / 2),
          )
        }
      })
      if (orbRef.current) {
        orbRef.current.style.transform =
          'translate(-50%, -50%) scale(1)'
        orbRef.current.style.boxShadow =
          '0 0 32px rgba(180, 139, 255, 0.55), 0 0 70px rgba(211, 183, 255, 0.45)'
      }
      visualizerRef.current?.style.setProperty(
        '--voice-energy',
        '0',
      )
      return
    }

    let isCancelled = false
    let animationFrameId: number | null = null
    let microphoneStream: MediaStream | null = null
    let audioContext: AudioContext | null = null
    let sourceNode: MediaStreamAudioSourceNode | null = null
    let analyserNode: AnalyserNode | null = null

    const startMicrophoneAnalysis = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Microphone API is not available')
        }

        microphoneStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true,
          },
        })

        if (isCancelled) {
          microphoneStream.getTracks().forEach((track) => track.stop())
          return
        }

        audioContext = new AudioContext()
        await audioContext.resume()
        analyserNode = audioContext.createAnalyser()
        analyserNode.fftSize = 256
        analyserNode.smoothingTimeConstant = 0.82
        sourceNode = audioContext.createMediaStreamSource(
          microphoneStream,
        )
        sourceNode.connect(analyserNode)

        const frequencyData = new Uint8Array(
          analyserNode.frequencyBinCount,
        )
        const timeDomainData = new Uint8Array(
          analyserNode.fftSize,
        )

        const drawVoiceFrame = () => {
          if (isCancelled || !analyserNode) {
            return
          }

          analyserNode.getByteFrequencyData(frequencyData)
          analyserNode.getByteTimeDomainData(timeDomainData)

          let squaredAmplitudeTotal = 0
          timeDomainData.forEach((sample) => {
            const normalizedSample = (sample - 128) / 128
            squaredAmplitudeTotal += normalizedSample ** 2
          })
          const rootMeanSquare = Math.sqrt(
            squaredAmplitudeTotal / timeDomainData.length,
          )
          const voiceEnergy = Math.min(1, rootMeanSquare * 7)

          barRefs.current.forEach((bar, index) => {
            if (!bar) {
              return
            }
            const frequencyEnergy =
              frequencyData[BAR_FREQUENCY_BINS[index]] / 255
            const centerWeight =
              1 - Math.abs(index - 4) * 0.055
            const nextHeight = Math.min(
              120,
              8
                + BAR_IDLE_HEIGHTS[index] * 0.55
                + frequencyEnergy * 50
                + voiceEnergy * 38 * centerWeight,
            )
            bar.setAttribute('height', String(nextHeight))
            bar.setAttribute(
              'y',
              String((VISUALIZER_HEIGHT - nextHeight) / 2),
            )
          })

          if (orbRef.current) {
            orbRef.current.style.transform =
              `translate(-50%, -50%) scale(${1 + voiceEnergy * 0.075})`
            orbRef.current.style.boxShadow = [
              `0 0 ${32 + voiceEnergy * 18}px rgba(180, 139, 255, ${0.55 + voiceEnergy * 0.12})`,
              `0 0 ${70 + voiceEnergy * 32}px rgba(211, 183, 255, ${0.45 + voiceEnergy * 0.12})`,
            ].join(', ')
          }
          visualizerRef.current?.style.setProperty(
            '--voice-energy',
            voiceEnergy.toFixed(3),
          )

          animationFrameId = window.requestAnimationFrame(
            drawVoiceFrame,
          )
        }

        drawVoiceFrame()
      } catch {
        if (!isCancelled) {
          onMicrophoneError()
        }
      }
    }

    void startMicrophoneAnalysis()

    return () => {
      isCancelled = true
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }
      sourceNode?.disconnect()
      analyserNode?.disconnect()
      microphoneStream?.getTracks().forEach((track) => track.stop())
      if (audioContext && audioContext.state !== 'closed') {
        void audioContext.close()
      }
    }
  }, [isListening, onMicrophoneError])

  return (
    <div
      ref={visualizerRef}
      className={`voice-visualizer ${
        isListening ? 'voice-visualizer--listening' : ''
      }`}
      aria-hidden="true"
    >
      <div className="voice-ring voice-ring--outer" />
      <div className="voice-ring voice-ring--middle" />

      <div className="voice-orbit voice-orbit--outer">
        <span className="voice-orbit-dot voice-orbit-dot--one" />
        <span className="voice-orbit-dot voice-orbit-dot--two" />
      </div>
      <div className="voice-orbit voice-orbit--middle">
        <span className="voice-orbit-dot voice-orbit-dot--three" />
      </div>

      <div ref={orbRef} className="voice-visualizer-orb">
        <div className="voice-visualizer-orb-surface" />
        <svg
          className="voice-visualizer-bars"
          viewBox={`0 0 128 ${VISUALIZER_HEIGHT}`}
          width="128"
          height={VISUALIZER_HEIGHT}
          fill="#ffffff"
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'block',
            width: '116px',
            height: '116px',
            maxWidth: '76%',
            maxHeight: '78%',
            overflow: 'visible',
          }}
          role="presentation"
        >
          {BAR_IDLE_HEIGHTS.map((height, index) => (
            <rect
              key={`${height}-${index}`}
              ref={(element) => {
                barRefs.current[index] = element
              }}
              className="voice-visualizer-bar"
              x={index * 14 + 4.5}
              y={(VISUALIZER_HEIGHT - height) / 2}
              width="7"
              height={height}
              rx="3.5"
              fill="#ffffff"
              opacity="1"
            />
          ))}
        </svg>
      </div>
    </div>
  )
}


export default VoiceVisualizer
