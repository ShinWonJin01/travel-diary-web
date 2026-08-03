<template>
  <section class="panel-card">
    <div class="panel-heading">
      <h2>지도</h2>
    </div>

    <div class="map-card map-card-large">
      <div class="map-canvas">
        <div class="map-grid"></div>

        <svg class="map-route" viewBox="0 0 500 700" aria-hidden="true">
          <path
            d="M120 120 C 170 180, 240 150, 270 240 S 330 360, 290 460 S 180 560, 220 640"
          />
        </svg>

        <span class="map-pin pin-1"></span>
        <span class="map-pin pin-2"></span>
        <span class="map-pin pin-3"></span>
        <span class="map-pin pin-4"></span>
        <span class="map-pin pin-5"></span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel-card {
  padding: 18px;
  border: 1px solid #e6eaf2;
  border-radius: 14px;
  background: #ffffff;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-heading h2 {
  margin: 0;
  font-size: 18px;
  color: #222834;
}

.map-card {
  padding: 14px;
  border: 1px solid #e6eaf2;
  border-radius: 14px;
  background: #ffffff;
}

.map-canvas {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 610px;
  border-radius: 12px;
  background: #ebe6d8;
}

.map-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      rgba(255, 255, 255, 0.3) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.3) 1px,
      transparent 1px
    ),
    radial-gradient(
      circle at 20% 20%,
      rgba(123, 176, 232, 0.35),
      transparent 18%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(123, 176, 232, 0.28),
      transparent 18%
    ),
    linear-gradient(135deg, #f1ebdd, #e6dece);
  background-size:
    32px 32px,
    32px 32px,
    auto,
    auto,
    auto;
}

.map-route {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.map-route path {
  fill: none;
  stroke: #2f68f2;
  stroke-width: 10;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.map-pin {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 4px solid #ffffff;
  border-radius: 50%;
  background: #2f68f2;
  box-shadow: 0 4px 10px rgba(47, 104, 242, 0.35);
}

.pin-1 {
  top: 90px;
  left: 95px;
}

.pin-2 {
  top: 205px;
  left: 245px;
}

.pin-3 {
  top: 330px;
  left: 285px;
}

.pin-4 {
  top: 460px;
  left: 225px;
}

.pin-5 {
  top: 580px;
  left: 195px;
}

@media (max-width: 760px) {
  .panel-card {
    margin: 10px 10px 0;
    padding: 12px 11px;
    border-radius: 10px;
  }

  .panel-heading {
    margin-bottom: 10px;
  }

  .panel-heading h2 {
    font-size: 14px;
  }

  .map-card {
    padding: 7px;
    border-radius: 10px;
  }

  .map-card-large .map-canvas {
    height: 320px;
  }

  .map-canvas {
    border-radius: 8px;
  }

  .map-route path {
    stroke-width: 8;
  }

  .map-pin {
    width: 14px;
    height: 14px;
    border-width: 3px;
    box-shadow: 0 3px 8px rgba(47, 104, 242, 0.3);
  }

  .pin-1 {
    top: 18%;
    left: 20%;
  }

  .pin-2 {
    top: 36%;
    left: 49%;
  }

  .pin-3 {
    top: 53%;
    left: 62%;
  }

  .pin-4 {
    top: 69%;
    left: 50%;
  }

  .pin-5 {
    top: 84%;
    left: 38%;
  }
}
</style>