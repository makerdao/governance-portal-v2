import Link from 'next/link';
import { Link as ThemeUILink, ThemeUIStyleObject } from 'theme-ui';

type Props = {
  children: JSX.Element;
  href: string;
  title: string;
  styles?: ThemeUIStyleObject;
  queryParams?: Record<string, string>;
  hash?: string;
  scroll?: boolean;
};

export const InternalLink = ({
  children,
  title,
  href,
  styles,
  queryParams,
  hash,
  scroll = true
}: Props): JSX.Element => (
  <Link
    href={{ pathname: href, query: queryParams, hash }}
    scroll={scroll}
    title={title}
    sx={{ textDecoration: 'none', color: 'inherit', ...styles }}
  >
    {children}
  </Link>
);
