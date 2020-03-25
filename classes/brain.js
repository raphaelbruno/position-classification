class Brain {
  constructor(outputs) {
    this.inputs = 2;
    this.outputs = outputs;
    this.hiddens = this.outputs * this.inputs;
    this.epochs = 300;
    this.learnRate = 0.5;
    this.loss = null;

    tf.tidy(() => {
      // Hidden
      var hiddenLayer = tf.layers.dense({
        units: this.hiddens,
        inputShape: [this.inputs],
        activation: 'sigmoid'
      });

      // Output
      var outputLayer = tf.layers.dense({
        units: this.outputs,
        activation: 'softmax'
      });

      // Optimizer
      let optimizer = tf.train.sgd(this.learnRate);

      // Model
      this.model = tf.sequential();
      this.model.add(hiddenLayer);
      this.model.add(outputLayer);
      this.model.compile({
        optimizer,
        loss: 'categoricalCrossentropy'
      });
    });
  }

  dispose() {
    this.model.dispose();
  }

  train(x, y, callback) {
    let xs = tf.tensor2d(x);
    let ys = tf.tensor2d(y);
    this.model.fit(xs, [ys], {
      epochs: this.epochs,
      validationSplit: 0.1,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          this.loss = logs.loss;
          if (callback) callback((epoch+1)/this.epochs);
        }
      }
    }).then(result => {
      xs.dispose();
      ys.dispose();
      this.loss = result.history.loss[result.history.loss.length - 1];
    });
  }

  predict(x, y) {
    return tf.tidy(() => {
      let input = tf.tensor2d([[x, y]]);
      let guess = this.model.predict(input);
      return guess.argMax(1).dataSync()[0];
    });
  }
}