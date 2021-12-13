// TODO: Refactor
// TODO: Use nicer SVGs
// TODO: Render starship thrusters
// TODO: Add game over screen
// TODO: Add start game screen (with controls)
// TODO: Add background with stars

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

const getDegToRad = (degrees) => degrees * (Math.PI / 180);
const getRadToDeg = (radians) => radians * (180 / Math.PI);
const getDistance = (
  { position: { x: x1, y: y1 } },
  { position: { x: x2, y: y2 } }
) => ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;

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
  canFire: true,
};

let torpedoes = [];

let asteroids = [
  {
    size: 2,
    // TODO: Get random position half the canvas diagonal away from the ship
    position: {
      x: 0,
      y: 0,
    },
    direction: Math.random() * 360,
    rotation: Math.random() * 360,
    exploded: false,
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
  // TODO: Render spillover parts of object when crossing canvas edges

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the ship
  ctx.save();
  ctx.translate(starship.position.x, starship.position.y);
  ctx.rotate(-1 * getDegToRad(starship.rotation - 90));
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
    ctx.save();
    ctx.translate(asteroid.position.x, asteroid.position.y);
    ctx.rotate(-1 * getDegToRad(asteroid.rotation - 90));
    ctx.translate(-asteroid.position.x, -asteroid.position.y);
    ctx.drawImage(
      asteroidImage,
      asteroid.position.x - asteroidImage.naturalWidth / 2,
      asteroid.position.y - asteroidImage.naturalHeight / 2,
      asteroidImage.naturalWidth,
      asteroidImage.naturalHeight
    );
    ctx.restore();
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
  if (event.key === " " && starship.canFire) {
    starship.canFire = false;
    setTimeout(() => {
      starship.canFire = true;
    }, 500);
    const moveVector = {
      x:
        (Math.cos(getDegToRad(starship.rotation)) || 0) *
        (starship.forwardSpeed + 2),
      y:
        (Math.sin(getDegToRad(starship.rotation)) || 0) *
        (starship.forwardSpeed + 2),
    };
    const driftVector = {
      x:
        (Math.cos(getDegToRad(starship.driftDirection)) || 0) *
        starship.driftSpeed,
      y:
        (Math.sin(getDegToRad(starship.driftDirection)) || 0) *
        starship.driftSpeed,
    };
    const deltaXDrift = driftVector.x + moveVector.x;
    const deltaYDrift = driftVector.y + moveVector.y;
    let direction;
    if (starship.driftSpeed === 0) {
      direction = starship.rotation;
    } else {
      direction =
        getRadToDeg(Math.atan(deltaYDrift / deltaXDrift || 0)) +
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
      detonated: false,
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
    x: (Math.cos(getDegToRad(starship.rotation)) || 0) * starship.forwardSpeed,
    y: (Math.sin(getDegToRad(starship.rotation)) || 0) * starship.forwardSpeed,
  };
  const driftVector = {
    x:
      (Math.cos(getDegToRad(starship.driftDirection)) || 0) *
      starship.driftSpeed,
    y:
      (Math.sin(getDegToRad(starship.driftDirection)) || 0) *
      starship.driftSpeed,
  };
  const deltaXDrift = driftVector.x + moveVector.x;
  const deltaYDrift = driftVector.y + moveVector.y;
  if (starship.driftSpeed === 0) {
    starship.driftDirection = starship.rotation;
  } else {
    starship.driftDirection =
      getRadToDeg(Math.atan(deltaYDrift / deltaXDrift || 0)) +
      (deltaXDrift < 0 ? 180 : 0);
  }
  starship.driftSpeed = (deltaXDrift ** 2 + deltaYDrift ** 2) ** 0.5;
  starship.position.x +=
    starship.driftSpeed * Math.cos(getDegToRad(starship.driftDirection)) || 0;
  if (starship.position.x < 0) {
    starship.position.x += ctx.canvas.width;
  }
  if (starship.position.x > ctx.canvas.width) {
    starship.position.x -= ctx.canvas.width;
  }
  starship.position.y -=
    starship.driftSpeed * Math.sin(getDegToRad(starship.driftDirection)) || 0;
  if (starship.position.y < 0) {
    starship.position.y += ctx.canvas.height;
  }
  if (starship.position.y > ctx.canvas.height) {
    starship.position.y -= ctx.canvas.height;
  }

  // Move torpedoes
  torpedoes.forEach((torpedo) => {
    torpedo.position.x +=
      torpedo.speed * Math.cos(getDegToRad(torpedo.direction)) || 0;
    if (torpedo.position.x < 0) {
      torpedo.position.x += ctx.canvas.width;
    }
    if (torpedo.position.x > ctx.canvas.width) {
      torpedo.position.x -= ctx.canvas.width;
    }
    torpedo.position.y -=
      torpedo.speed * Math.sin(getDegToRad(torpedo.direction)) || 0;
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
    const deltaPosition = {
      x: asteroidSpeed * Math.cos(getDegToRad(asteroid.direction)) || 0,
      y: asteroidSpeed * Math.sin(getDegToRad(asteroid.direction)) || 0,
    };
    asteroid.position.x += deltaPosition.x;
    if (asteroid.position.x < 0) {
      asteroid.position.x += ctx.canvas.width;
    }
    if (asteroid.position.x > ctx.canvas.width) {
      asteroid.position.x -= ctx.canvas.width;
    }
    asteroid.position.y -= deltaPosition.y;
    if (asteroid.position.y < 0) {
      asteroid.position.y += ctx.canvas.height;
    }
    if (asteroid.position.y > ctx.canvas.height) {
      asteroid.position.y -= ctx.canvas.height;
    }
    asteroid.rotation += asteroidSpeed;
    if (asteroid.rotation > 360) {
      asteroid.rotation -= 360;
    }
  });

  // Detect torpedo collisions
  torpedoes.forEach((torpedo, torpedoIndex) => {
    // Torpedo hitting asteroid
    // TODO: Count score
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
      if (getDistance(torpedo, asteroid) <= asteroidImage.naturalWidth / 2) {
        torpedo.detonated = true;
        asteroid.exploded = true;
      }
    });

    // Torpedo hitting another torpedo
    torpedoes.forEach((otherTorpedo, otherTorpedoIndex) => {
      if (torpedoIndex !== otherTorpedoIndex) {
        if (
          getDistance(torpedo, otherTorpedo) <=
          torpedoImage.naturalWidth / 2
        ) {
          torpedo.detonated = true;
          otherTorpedo.exploded = true;
        }
      }
    });

    // TODO: Torpedo hitting spaceship
  });

  // TODO: Asteroid hitting spaceship

  // Get rid of detonated torpedoes
  torpedoes = torpedoes.filter((torpedo) => !torpedo.detonated);

  // Split exploded asteroids
  asteroids = asteroids
    .map((asteroid) => {
      if (!asteroid.exploded) {
        return asteroid;
      }
      if (asteroid.size === 0) {
        return [];
      }
      return [
        {
          size: asteroid.size - 1,
          position: { x: asteroid.position.x, y: asteroid.position.y },
          direction: Math.random() * 360,
          rotation: Math.random() * 360,
          exploded: false,
        },
        {
          size: asteroid.size - 1,
          position: { x: asteroid.position.x, y: asteroid.position.y },
          direction: Math.random() * 360,
          rotation: Math.random() * 360,
          exploded: false,
        },
      ];
    })
    .flat();

  // TODO: Add asteroid when all asteroids have exploded half the canvas diagonal away from the ship
}, 1000 / 60);
