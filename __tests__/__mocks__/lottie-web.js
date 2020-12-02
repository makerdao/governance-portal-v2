const lottie = jest.createMockFromModule('lottie-web');

const animation = jest.fn()
lottie.animation = animation
export default lottie