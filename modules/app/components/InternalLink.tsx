import Link from 'next/link';
import { Link as ThemeUILink, ThemeUIStyleObject } from 'theme-ui';

type Props = {
  children: JSX.Element;
  href: string;
  title: string;
  styles?: ThemeUIStyleObject;
};

export const InternalLink = ({ children, title, href, styles }: Props): JSX.Element => (
  <Link href={{ pathname: href }} passHref>
    <ThemeUILink variant="nostyle" title={title} sx={{ ...styles }}>
      {children}
    </ThemeUILink>
  </Link>
);
