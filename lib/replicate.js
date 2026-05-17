// lib/replicate.js
// Run and ReplicatePool classes for statistical replicates.

class Run {
  constructor(id, scores) {
    this.id = id;
    this.scores = Array.isArray(scores) ? scores : [scores];
    this.n = this.scores.length;
    this.mean = this.scores.reduce((a, b) => a + b, 0) / this.n;
  }

  toJSON() {
    return { id: this.id, n: this.n, mean: this.mean, scores: this.scores };
  }
}

class ReplicatePool {
  constructor(runs) {
    this.runs = runs.map((s, i) => new Run(`r${i + 1}`, s));
  }

  get means() {
    return this.runs.map((r) => r.mean);
  }

  grandMean() {
    const all = this.runs.flatMap((r) => r.scores);
    return all.reduce((a, b) => a + b, 0) / all.length;
  }

  toJSON() {
    return {
      n_replicates: this.runs.length,
      grand_mean: this.grandMean(),
      means: this.means,
      runs: this.runs.map((r) => r.toJSON()),
    };
  }
}

module.exports = { Run, ReplicatePool };
