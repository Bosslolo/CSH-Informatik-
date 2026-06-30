import type { CarState } from './carState';

export type { CarState } from './carState';

export class CarSynthesis {
  private state: CarState;
  private isRunning = true;

  constructor() {
    this.state = {
      rpm: 800,
      speed_kmh: 0,
      fuel_liters: 45.5,
      motor_temp: 20,
      gear: 1,
      battery_voltage: 12.4,
      throttle_percent: 0,
      intake_air_temp: 18,
      timestamp: new Date().toISOString(),
    };
    this.startSimulation();
  }

  private startSimulation() {
    setInterval(() => {
      if (!this.isRunning) return;

      const rpmNoise = (Math.random() - 0.5) * 50;
      if (this.state.speed_kmh === 0) {
        this.state.rpm = Math.max(750, Math.min(850, 800 + rpmNoise));
        this.state.throttle_percent = Math.max(
          0,
          this.state.throttle_percent - 2
        );
      } else {
        this.state.rpm =
          1000 + this.state.speed_kmh * 30 + rpmNoise;
        this.state.throttle_percent = Math.min(
          100,
          this.state.throttle_percent + randomInRange(1, 8)
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

      if (Math.random() > 0.95) {
        this.state.speed_kmh = clamp(
          this.state.speed_kmh + (Math.random() - 0.4) * 10,
          0,
          180
        );
      }

      if (this.state.speed_kmh > 0) {
        this.state.gear = Math.min(
          6,
          Math.max(1, Math.round(this.state.speed_kmh / 35))
        );
      } else {
        this.state.gear = 1;
      }

      this.state.timestamp = new Date().toISOString();
    }, 1000);
  }

  public getLiveState(): CarState {
    return { ...this.state };
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
