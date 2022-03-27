import Link from 'next/link';
import { Link as ThemeUILink, ThemeUIStyleObject } from 'theme-ui';

type Props = {
  children: JSX.Element;
  href: string;
  title: string;
  styles?: ThemeUIStyleObject;
  queryParams?: Record<string, string>;
};

export const InternalLink = ({ children, title, href, styles, queryParams }: Props): JSX.Element => (
  <Link href={{ pathname: href, query: queryParams }} passHref>
    <ThemeUILink variant="nostyle" title={title} sx={{ ...styles }}>
      {children}
    </ThemeUILink>
  </Link>
);
