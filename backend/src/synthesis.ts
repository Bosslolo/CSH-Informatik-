import type { CarState } from './carState';

export type { CarState } from './carState';

const DRIVE_TICK_MS = 80;
const SPEED_MAX_KMH = 320;
const DRIVE_PHYSICS = {
  gasBase: 0.62,
  gasFalloff: 280,
  brake: 0.85,
  coast: 0.045,
  throttleGas: 5,
  throttleBrake: 10,
  brakeBuild: 11,
  brakeRelease: 9,
  throttleCoast: 1.2,
};

export class CarSynthesis {
  private state: CarState;
  private isRunning = true;
  private gasPressed = false;
  private brakePressed = false;

  constructor() {
    this.state = {
      rpm: 800,
      speed_kmh: 0,
      fuel_liters: 45.5,
      motor_temp: 20,
      gear: 1,
      battery_voltage: 12.4,
      throttle_percent: 0,
      brake_percent: 0,
      intake_air_temp: 18,
      timestamp: new Date().toISOString(),
    };
    this.startSimulation();
  }

  setControls(gas: boolean, brake: boolean) {
    this.gasPressed = gas;
    this.brakePressed = brake;
  }

  private startSimulation() {
    setInterval(() => this.applyDriveControls(), DRIVE_TICK_MS);

    setInterval(() => {
      if (!this.isRunning) return;

      const rpmNoise = (Math.random() - 0.5) * 40;
      if (this.state.speed_kmh === 0) {
        this.state.rpm = Math.max(750, Math.min(850, 800 + rpmNoise));
        if (!this.gasPressed) {
          this.state.throttle_percent = Math.max(
            0,
            this.state.throttle_percent - 1.5
          );
        }
      } else {
        this.state.rpm = clamp(
          1000 +
            this.state.speed_kmh * 28 +
            this.state.throttle_percent * 8 -
            this.state.brake_percent * 4 +
            rpmNoise,
          900,
          6500
        );
      }

      if (this.state.motor_temp < 90) {
        this.state.motor_temp += 0.05;
      } else {
        this.state.motor_temp += (Math.random() - 0.5) * 0.5;
      }

      this.state.intake_air_temp = clamp(
        this.state.intake_air_temp + randomInRange(-0.3, 0.3),
        10,
        55
      );

      this.state.battery_voltage = clamp(
        this.state.battery_voltage + randomInRange(-0.02, 0.02),
        11.5,
        14.8
      );

      this.state.fuel_liters = Math.max(0, this.state.fuel_liters - 0.0001);

      if (
        !this.gasPressed &&
        !this.brakePressed &&
        this.state.speed_kmh > 0 &&
        Math.random() > 0.985
      ) {
        this.state.speed_kmh = clamp(
          this.state.speed_kmh - randomInRange(0, 0.8),
          0,
          SPEED_MAX_KMH
        );
      }

      this.state.timestamp = new Date().toISOString();
    }, 1000);
  }

  public getLiveState(): CarState {
    return { ...this.state };
  }

  private gasSpeedDelta(speedKmh: number) {
    const headroom = Math.max(0, 1 - speedKmh / DRIVE_PHYSICS.gasFalloff);
    return DRIVE_PHYSICS.gasBase * Math.max(0.18, headroom);
  }

  private applyDriveControls() {
    if (!this.isRunning) return;

    if (this.gasPressed && !this.brakePressed) {
      this.state.speed_kmh = clamp(
        this.state.speed_kmh + this.gasSpeedDelta(this.state.speed_kmh),
        0,
        SPEED_MAX_KMH
      );
      this.state.throttle_percent = clamp(
        this.state.throttle_percent + DRIVE_PHYSICS.throttleGas,
        0,
        100
      );
      this.state.brake_percent = clamp(
        this.state.brake_percent - DRIVE_PHYSICS.brakeRelease,
        0,
        100
      );
    } else if (this.brakePressed) {
      this.gasPressed = false;
      this.state.speed_kmh = clamp(
        this.state.speed_kmh - DRIVE_PHYSICS.brake,
        0,
        SPEED_MAX_KMH
      );
      this.state.brake_percent = clamp(
        this.state.brake_percent + DRIVE_PHYSICS.brakeBuild,
        0,
        100
      );
      this.state.throttle_percent = clamp(
        this.state.throttle_percent - DRIVE_PHYSICS.throttleBrake,
        0,
        100
      );
    } else {
      this.state.brake_percent = clamp(
        this.state.brake_percent - DRIVE_PHYSICS.brakeRelease,
        0,
        100
      );
      if (this.state.speed_kmh > 0) {
        this.state.speed_kmh = clamp(
          this.state.speed_kmh - DRIVE_PHYSICS.coast,
          0,
          SPEED_MAX_KMH
        );
        this.state.throttle_percent = clamp(
          this.state.throttle_percent - DRIVE_PHYSICS.throttleCoast,
          0,
          100
        );
      } else {
        this.state.throttle_percent = clamp(
          this.state.throttle_percent - 1.5,
          0,
          100
        );
      }
    }

    if (this.state.speed_kmh > 0) {
      this.state.gear = Math.min(
        8,
        Math.max(1, Math.round(this.state.speed_kmh / 42))
      );
    } else {
      this.state.gear = 1;
    }

    this.state.timestamp = new Date().toISOString();
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
