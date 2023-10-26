import matter from 'gray-matter';

interface MatterResult {
  data: any;
  content: string;
}

export function matterWrapper(document: string): MatterResult {
  const { data, content } = matter(document || '', {
    engines: {
      javascript: {
        parse: function () {
          console.log('Parsing JavaScript is not allowed');
          return {};
        },
        stringify: function () {
          console.log('Stringifying JavaScript is not allowed');
          return '';
        }
      }
    }
  });
  return { data, content };
}
