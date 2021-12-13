document.getElementById("grid").innerHTML = Array(100)
  .fill(`<div></div>`)
  .join("");

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

const degToRad = (degrees) => degrees * (Math.PI / 180);
const radToDeg = (radians) => radians * (180 / Math.PI);

const starship = {
  position: {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  },
  rotation: 90,
  driftDirection: 0,
  driftSpeed: 0,
  rotationMomentum: 0,
  forwardSpeed: 0,
};

const torpedoes = [];

const asteroids = [
  {
    size: 2,
    position: {
      x: 0,
      y: 0,
    },
    direction: -45,
    rotation: 0,
  },
];

const rotationSpeedChange = 0.1;
const movementSpeedChange = 0.01;

const starshipImage = new Image();
starshipImage.src = "./starship.svg";

const torpedoImage = new Image();
torpedoImage.src = "./torpedo.svg";

const asteroidBigImage = new Image();
asteroidBigImage.src = "./asteroid-big.svg";

const asteroidMediumImage = new Image();
asteroidMediumImage.src = "./asteroid-medium.svg";

const asteroidSmallImage = new Image();
asteroidSmallImage.src = "./asteroid-small.svg";

const draw = () => {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the ship
  ctx.save();
  ctx.translate(starship.position.x, starship.position.y);
  ctx.rotate(-1 * degToRad(starship.rotation - 90));
  ctx.translate(-starship.position.x, -starship.position.y);
  ctx.drawImage(
    starshipImage,
    starship.position.x - starshipImage.naturalWidth / 2,
    starship.position.y - starshipImage.naturalHeight / 2,
    starshipImage.naturalWidth,
    starshipImage.naturalHeight
  );
  ctx.restore();

  // Draw the torpedoes
  torpedoes.forEach((torpedo) => {
    ctx.drawImage(
      torpedoImage,
      torpedo.position.x - torpedoImage.naturalWidth / 2,
      torpedo.position.y - torpedoImage.naturalHeight / 2,
      torpedoImage.naturalWidth,
      torpedoImage.naturalHeight
    );
  });

  // Draw the asteroids
  asteroids.forEach((asteroid) => {
    let asteroidImage;
    if (asteroid.size === 2) {
      asteroidImage = asteroidBigImage;
    }
    if (asteroid.size === 1) {
      asteroidImage = asteroidMediumImage;
    }
    if (asteroid.size === 0) {
      asteroidImage = asteroidSmallImage;
    }
    ctx.drawImage(
      asteroidImage,
      asteroid.position.x - asteroidImage.naturalWidth / 2,
      asteroid.position.y - asteroidImage.naturalHeight / 2,
      asteroidImage.naturalWidth,
      asteroidImage.naturalHeight
    );
  });

  // Request next frame
  requestAnimationFrame(draw);
};

requestAnimationFrame(draw);

let rotationMomentumChangeInterval = null;
let forwardSpeedChangeInterval = null;

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    starship.rotationMomentum += rotationSpeedChange;
    clearInterval(rotationMomentumChangeInterval);
    rotationMomentumChangeInterval = setInterval(() => {
      starship.rotationMomentum += rotationSpeedChange;
    }, 50);
  }
  if (event.key === "ArrowRight") {
    starship.rotationMomentum -= rotationSpeedChange;
    clearInterval(rotationMomentumChangeInterval);
    rotationMomentumChangeInterval = setInterval(() => {
      starship.rotationMomentum -= rotationSpeedChange;
    }, 50);
  }
  if (event.key === "ArrowUp") {
    if (starship.forwardSpeed < 0) {
      starship.forwardSpeed = 0;
    }
    starship.forwardSpeed += movementSpeedChange;
    clearInterval(forwardSpeedChangeInterval);
    forwardSpeedChangeInterval = setInterval(() => {
      starship.forwardSpeed += movementSpeedChange;
    }, 50);
  }
  if (event.key === "ArrowDown") {
    if (starship.forwardSpeed > 0) {
      starship.forwardSpeed = 0;
    }
    starship.forwardSpeed -= movementSpeedChange;
    clearInterval(forwardSpeedChangeInterval);
    forwardSpeedChangeInterval = setInterval(() => {
      starship.forwardSpeed -= movementSpeedChange;
    }, 50);
  }
  if (event.key === " ") {
    const moveVector = {
      x:
        (Math.cos(degToRad(starship.rotation)) || 0) *
        (starship.forwardSpeed + 2),
      y:
        (Math.sin(degToRad(starship.rotation)) || 0) *
        (starship.forwardSpeed + 2),
    };
    const driftVector = {
      x:
        (Math.cos(degToRad(starship.driftDirection)) || 0) *
        starship.driftSpeed,
      y:
        (Math.sin(degToRad(starship.driftDirection)) || 0) *
        starship.driftSpeed,
    };
    const deltaXDrift = driftVector.x + moveVector.x;
    const deltaYDrift = driftVector.y + moveVector.y;
    let direction;
    if (starship.driftSpeed === 0) {
      direction = starship.direction;
    } else {
      direction =
        radToDeg(Math.atan(deltaYDrift / deltaXDrift || 0)) +
        (deltaXDrift < 0 ? 180 : 0);
    }
    const speed = (deltaXDrift ** 2 + deltaYDrift ** 2) ** 0.5;
    torpedoes.push({
      position: {
        x: starship.position.x,
        y: starship.position.y,
      },
      direction,
      speed,
    });
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") {
    clearInterval(rotationMomentumChangeInterval);
  }
  if (event.key === "ArrowRight") {
    clearInterval(rotationMomentumChangeInterval);
  }
  if (event.key === "ArrowUp") {
    clearInterval(forwardSpeedChangeInterval);
    starship.forwardSpeed = 0;
  }
  if (event.key === "ArrowDown") {
    clearInterval(forwardSpeedChangeInterval);
    starship.forwardSpeed = 0;
  }
});

setInterval(() => {
  // Move starship
  starship.rotation += starship.rotationMomentum;
  const moveVector = {
    x: (Math.cos(degToRad(starship.rotation)) || 0) * starship.forwardSpeed,
    y: (Math.sin(degToRad(starship.rotation)) || 0) * starship.forwardSpeed,
  };
  const driftVector = {
    x: (Math.cos(degToRad(starship.driftDirection)) || 0) * starship.driftSpeed,
    y: (Math.sin(degToRad(starship.driftDirection)) || 0) * starship.driftSpeed,
  };
  const deltaXDrift = driftVector.x + moveVector.x;
  const deltaYDrift = driftVector.y + moveVector.y;
  if (starship.driftSpeed === 0) {
    starship.driftDirection = starship.rotation;
  } else {
    starship.driftDirection =
      radToDeg(Math.atan(deltaYDrift / deltaXDrift || 0)) +
      (deltaXDrift < 0 ? 180 : 0);
  }
  starship.driftSpeed = (deltaXDrift ** 2 + deltaYDrift ** 2) ** 0.5;
  starship.position.x +=
    starship.driftSpeed * Math.cos(degToRad(starship.driftDirection)) || 0;
  if (starship.position.x < 0) {
    starship.position.x += ctx.canvas.width;
  }
  if (starship.position.x > ctx.canvas.width) {
    starship.position.x -= ctx.canvas.width;
  }
  starship.position.y -=
    starship.driftSpeed * Math.sin(degToRad(starship.driftDirection)) || 0;
  if (starship.position.y < 0) {
    starship.position.y += ctx.canvas.height;
  }
  if (starship.position.y > ctx.canvas.height) {
    starship.position.y -= ctx.canvas.height;
  }

  // Move torpedoes
  torpedoes.forEach((torpedo) => {
    torpedo.position.x +=
      torpedo.speed * Math.cos(degToRad(torpedo.direction)) || 0;
    if (torpedo.position.x < 0) {
      torpedo.position.x += ctx.canvas.width;
    }
    if (torpedo.position.x > ctx.canvas.width) {
      torpedo.position.x -= ctx.canvas.width;
    }
    torpedo.position.y -=
      torpedo.speed * Math.sin(degToRad(torpedo.direction)) || 0;
    if (torpedo.position.y < 0) {
      torpedo.position.y += ctx.canvas.height;
    }
    if (torpedo.position.y > ctx.canvas.height) {
      torpedo.position.y -= ctx.canvas.height;
    }
  });

  // Move asteroids
  asteroids.forEach((asteroid) => {
    const asteroidSpeed = 3 - asteroid.size;
    asteroid.position.x +=
      asteroidSpeed * Math.cos(degToRad(asteroid.direction)) || 0;
    if (asteroid.position.x < 0) {
      asteroid.position.x += ctx.canvas.width;
    }
    if (asteroid.position.x > ctx.canvas.width) {
      asteroid.position.x -= ctx.canvas.width;
    }
    asteroid.position.y -=
      asteroidSpeed * Math.sin(degToRad(asteroid.direction)) || 0;
    if (asteroid.position.y < 0) {
      asteroid.position.y += ctx.canvas.height;
    }
    if (asteroid.position.y > ctx.canvas.height) {
      asteroid.position.y -= ctx.canvas.height;
    }
  });

  // Print debug
  document.getElementById("debug").innerHTML = `
    <table>
      <tbody>
        <tr><th>Rotation</th><td>${starship.rotation.toFixed(4)}</td></tr>
        <tr><th>X</th><td>${starship.position.x.toFixed(4)}</td></tr>
        <tr><th>Y</th><td>${starship.position.y.toFixed(4)}</td></tr>
        <tr><th>Forward speed</th><td>${starship.forwardSpeed.toFixed(
          4
        )}</td></tr>
        <tr><th>Rotation momentum</th><td>${starship.rotationMomentum.toFixed(
          4
        )}</td></tr>
        <tr><th>Drift speed</th><td>${starship.driftSpeed.toFixed(4)}</td></tr>
        <tr><th>Drift direction</th><td>${starship.driftDirection.toFixed(
          4
        )}</td></tr>
        <tr><th>Drift X</th><td>${driftVector.x.toFixed(4)}</td></tr>
        <tr><th>Drift Y</th><td>${driftVector.y.toFixed(4)}</td></tr>
        <tr><th>Move X</th><td>${moveVector.x.toFixed(4)}</td></tr>
        <tr><th>Move Y</th><td>${moveVector.y.toFixed(4)}</td></tr>
        <tr><th>Delta X drift</th><td>${deltaXDrift.toFixed(4)}</td></tr>
        <tr><th>Delta Y drift</th><td>${deltaYDrift.toFixed(4)}</td></tr>
      </tbody>
    </table>
  `;
}, 1000 / 60);
