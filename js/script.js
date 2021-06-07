const video = document.getElementById('video')
let predictedAges = [] 

Promise.all([

    faceapi.nets.tinyFaceDetector.loadFromUri('/reconhecer-face/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/reconhecer-face/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/reconhecer-face/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/reconhecer-face/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/reconhecer-face/models') 

 ]).then(iniciarVideo)
 


/*Pelo que compreendi aqui criamos uma função que ira pedir ao navegador 
o acesso a camera e dps ira jogar a imagem na tag video criada no html*/ 
function iniciarVideo(){
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,

    arr => console.error(err)

  )

}

video.addEventListener('play', () => {
    
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)

    const displaySize = { width: video.width, height: video.height} 
    faceapi.matchDimensions(canvas, displaySize)

    setInterval(async () =>{
        
        //detecta o rosto humano
        const detectar =  await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
       
        const resizedDetections = faceapi.resizeResults(detectar, displaySize)

        canvas.getContext('2d').clearRect(0, 0 , canvas.width, canvas.height)

        //enquadra o rosto
        faceapi.draw.drawDetections(canvas,resizedDetections)
        //traceja o rosto, olhos, boca e nariz
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)    
        //Reconheçe e mostra as expresoes 
        const ex = faceapi.draw.drawFaceExpressions(canvas, resizedDetections  )  

        //contador idade
        const age = resizedDetections[0].age;
        const interpolatedAge = interpolateAgePredictions(age);
        const bottomRight = {
          x: resizedDetections[0].detection.box.bottomRight.x - 50,
          y: resizedDetections[0].detection.box.bottomRight.y
        };
    
        new faceapi.draw.DrawTextField(
          [`${faceapi.utils.round(interpolatedAge, 0)} years`],
          bottomRight
        ).draw(canvas);
      }, 100);
    });
    
    function interpolateAgePredictions(age) {
      predictedAges = [age].concat(predictedAges).slice(0, 30);
      const avgPredictedAge =
        predictedAges.reduce((total, a) => total + a) / predictedAges.length;
      return avgPredictedAge;
    }
