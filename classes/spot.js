class Spot {
  constructor(x, y, color){
    this.x = x;
    this.y = y;
    this.color = color ? color : 'white';
  }
  
  setColor(color){ this.color = color; }
  
  serialize(){
    return {
      x: this.x,
      y: this.y,
      color: this.color
    };
  }
  
  render(){
    push();
    noStroke();
    fill(this.color);
    circle(this.x, this.y, 25);
    pop();
  }
}