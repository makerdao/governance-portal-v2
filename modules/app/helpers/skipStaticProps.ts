import { config } from 'lib/config';

// if config value is empty string, return true
export const skipStaticProps = config.USE_STATIC_PROPS === '';
