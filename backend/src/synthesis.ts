export interface CarState {
  rpm: number;
  speed_kmh: number;
  fuel_liters: number;
  motor_temp: number;
  gear: number;
  timestamp: string; // ISO 8601 UTC to solve the teacher's time-zone problem
}

export class CarSynthesis {
  private state: CarState;
  private fuelCapacity = 55;
  private isRunning = true;

  constructor() {
    this.state = {
      rpm: 800,
      speed_kmh: 0,
      fuel_liters: 45.5,
      motor_temp: 20,
      gear: 1,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.startSimulation();
  }

  private startSimulation() {
    setInterval(() => {
      if (!this.isRunning) return;

      // Simulate a car idling and occasionally "driving"
      // RPM fluctuates slightly at idle, or increases if speed > 0
      const rpmNoise = (Math.random() - 0.5) * 50;
      if (this.state.speed_kmh === 0) {
        this.state.rpm = Math.max(750, Math.min(850, 800 + rpmNoise));
      } else {
        // Simple logic: RPM scales with speed for the synthesis tool
        this.state.rpm = 1000 + (this.state.speed_kmh * 30) + rpmNoise;
      }

      // Slowly heat up motor to operating temp (90C)
      if (this.state.motor_temp < 90) {
        this.state.motor_temp += 0.05;
      } else {
        this.state.motor_temp += (Math.random() - 0.5) * 0.5; // slight fluctuation
      }

      // Slowly consume fuel
      this.state.fuel_liters = Math.max(0, this.state.fuel_liters - 0.0001);

      // Randomly change speed to simulate a "running car"
      if (Math.random() > 0.95) {
        this.state.speed_kmh = Math.max(0, Math.min(180, this.state.speed_kmh + (Math.random() - 0.4) * 10));
      }

      // Update timestamp
      this.state.timestamp = new Date().toLocaleTimeString();
    }, 1000);
  }

  public getLiveState(): CarState {
    return { ...this.state };
  }
}