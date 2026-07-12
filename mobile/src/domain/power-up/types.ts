export interface PowerUpStep {
  currentLevel: number;
  levelAfterPowering: number;
  candyToUpgrade: number;
  xlCandyToUpgrade: number;
  stardustToUpgrade: number;
}

export interface PowerUpCost {
  candy: number;
  xlCandy: number;
  stardust: number;
}
