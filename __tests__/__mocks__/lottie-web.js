const lottie = jest.fn();

const animation = jest.fn()
const loadAnimation = jest.fn()
lottie.animation = animation
lottie.loadAnimation = loadAnimation
export default lottie