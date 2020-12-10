import { Box, Button } from 'theme-ui';
const TOGGLE_WIDTH = '3.8rem';
const BORDER_WIDTH = '0.2rem';
const TOGGLE_BUTTON_WIDTH = '1.7rem';

const InnerToggle = ({ active }) => {
  return (
    <Box
      sx={{
        transform: active
          ? `translateX(calc(${TOGGLE_WIDTH} - ( 2 * ${BORDER_WIDTH}) - ${TOGGLE_BUTTON_WIDTH}))`
          : undefined,
        transition: 'transform 0.2s',
        width: TOGGLE_BUTTON_WIDTH,
        height: TOGGLE_BUTTON_WIDTH,
        backgroundColor: 'white',
        borderRadius: '.85rem'
      }}
    ></Box>
  );
};

export default function Toggle({ active, onClick, disabled }) {
  return (
    <Button
      sx={{
        p: '0',
        transition: 'background-color 0.2s, border-color 0.2s',
        borderRadius: '1.15rem',
        background: active ? 'primary' : '#CCD6DA',
        width: TOGGLE_WIDTH,
        height: '2rem',
        border: `${BORDER_WIDTH} solid`,
        borderColor: active ? 'primary' : '#CCD6DA',
        cursor: 'pointer'
      }}
      aria-pressed={active}
      onClick={() => onClick(!active)}
      disabled={disabled}
      data-testid="allowance-toggle"
    >
      <InnerToggle active={active} />
    </Button>
  );
}
