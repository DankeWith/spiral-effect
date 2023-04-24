import './style.css'

const musicPlay = document.querySelector('.play') as HTMLButtonElement

musicPlay.addEventListener('click', async() => {
  const canvas = document.querySelector('#canvas1') as HTMLCanvasElement
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')!
  const fftSize = 512
  const res = await fetch('./synth.mp3')
  const buffer = await res.arrayBuffer()
  const bars: Bar[] = []


  const audioContext = new AudioContext()
  const audioBufferSource = audioContext.createBufferSource()
  const analyser = audioContext.createAnalyser()
  analyser.fftSize = fftSize
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  audioBufferSource.buffer = await audioContext.decodeAudioData(buffer)
  audioBufferSource.loop = true
  audioBufferSource.connect(analyser).connect(audioContext.destination)
  audioBufferSource.start(0)
  const initialized = true

  const createBars = () => {
    for (let i = 1; i < fftSize / 2; i++) {
      let color = `hsl(${i * 2}, 100%, 50%)`
      const bar = new Bar(0, i * 0.9, 1,0, color, i)
      bars.push(bar)
    }
  }
  createBars();

  const getSamples = (): number[]=> {
    if (!initialized) throw new Error('Audio player not initialized');
    analyser.getByteTimeDomainData(dataArray);
    const normSamples = [...dataArray].map((e) => e / 128 - 1);
    return normSamples;
  }

  function animate() {
    if (initialized) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save()
      ctx.translate(canvas.width / 2 - 70, canvas.height / 2 +50)

      const samples = getSamples()
      bars.forEach((bar, index) => {
        bar.update(samples[index])
        bar.draw(ctx)
      })
      ctx.restore()
    }
    requestAnimationFrame(animate);
  }
  animate()
})


class Bar {
  constructor(public x: number, public y: number, public width: number, public height: number, public color: string, public index: number ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = color
    this.index = index
  }

  update(musicInput:number){

    const sound = musicInput * 1000
    console.log(sound)
    if(sound > this.height){
      this.height = sound
    }else {
      this.height -= this.height * 0.03
    }
  }

  draw(context: CanvasRenderingContext2D ){
    context.strokeStyle = this.color;
    context.lineWidth = this.width;

    context.save()
    context.rotate(this.index* 0.043)
    context.beginPath()
    context.bezierCurveTo(this.x/2, this.y/2, this.height * -0.5 -150, this.height +50, this.x, this.y)
    context.stroke()

    if(this.index > 100){
      context.beginPath()
      context.arc(this.x, this.y + 10+ this.height / 2 + this.height * 0.01, this.height * 0.05, 0, Math.PI * 2);
      context.stroke()
      context.beginPath();
      context.moveTo(this.x, this.y +10)
      context.lineTo(this.x, this.y +10 + this.height/2)
      context.stroke();
    }
    context.restore()
  }
}