import Color from 'color';
import MersenneTwister from 'mersenne-twister';

const colors = [
  '#01888C', // teal
  '#FC7500', // bright orange
  '#034F5D', // dark teal
  '#F73F01', // orangered
  '#FC1960', // magenta
  '#C7144C', // raspberry
  '#F3C100', // goldenrod
  '#1598F2', // lightning blue
  '#2465E1', // sail blue
  '#F19E02' // gold
];

const wobble = 30;
const shapeCount = 3;

const styles = {
  container: {
    overflow: 'hidden'
  }
};

export interface Props {
  address: string;
  size: number;
}

export default function Jazzicon({ address, size }: Props) {
  const seed = parseInt(address.slice(2, 10), 16);

  const generator = new MersenneTwister(seed);
  const amount = generator.random() * 30 - wobble / 2;

  const localColors = colors.map(hex => new Color(hex).rotate(amount).hex());

  const randomColor = () => {
    // carlos: This is necessary because the @metamask/jazzicon implementation includes
    // this mistake, which affects determinism.
    const _rand = generator.random();
    const idx = Math.floor(localColors.length * generator.random());
    return localColors.splice(idx, 1)[0];
  };

  const backgroundColor = randomColor();

  const shapes = Array(shapeCount)
    .fill(0)
    .map((_, index) => {
      const center = size / 2;

      const firstRot = generator.random();
      const angle = Math.PI * 2 * firstRot;
      const velocity = (size / shapeCount) * generator.random() + (index * size) / shapeCount;

      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      const secondRot = generator.random();
      const rot = firstRot * 360 + secondRot * 180;
      const fill = randomColor();

      return (
        <rect
          key={`shape_${index}`}
          x={0}
          y={0}
          width={size}
          height={size}
          fill={fill}
          transform={`translate(${tx} ${ty}) rotate(${rot.toFixed(1)} ${center} ${center})`}
        />
      );
    });

  return (
    <div style={{ ...styles.container, width: size, height: size, backgroundColor, borderRadius: size / 2 }}>
      <svg width={`${size}px`} height={`${size}px`}>
        {shapes}
      </svg>
    </div>
  );
}
