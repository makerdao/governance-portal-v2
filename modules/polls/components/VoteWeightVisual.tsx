import { useEffect, useRef, useState } from 'react';
import { Box } from 'theme-ui';
import { select } from 'd3-selection';
import { pack, hierarchy } from 'd3-hierarchy';
import { cutMiddle } from 'lib/utils';
import { Poll, PollTally } from 'modules/polls/types';

type CircleProps = {
  poll: Poll;
  tally: PollTally;
  diameter: number;
};

export const CirclesSvg = ({ poll, tally, diameter }: CircleProps): JSX.Element => {
  if (!poll || !tally || !diameter) return <Box>Loading</Box>;
  const ref = useRef<SVGSVGElement>(null);

  const data = {
    title: 'votes',
    children: tally.votesByAddress
  };

  useEffect(() => {
    const svgElement = select(ref.current);
    svgElement.selectAll('*').remove();

    const width = diameter;
    const height = diameter;

    svgElement
      .attr('width', width)
      .attr('height', height)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('class', 'bubble');

    const bubble = pack().size([diameter, diameter]).padding(1);

    const nodes = hierarchy(data).sum(function (d) {
      return d.mkrSupport;
    });

    const node = svgElement
      .selectAll('.node')
      .data(bubble(nodes).descendants())
      .enter()
      .filter(function (d) {
        return d.children == null;
      })
      .append('g')
      .attr('class', 'node')
      .attr('transform', function (d) {
        return `translate(${d.x},${d.y})`;
      });

    node.append('title').text(d => {
      return d.data.voter;
    });

    node
      .append('circle')
      .attr('r', function (d) {
        return d.r;
      })
      .style('fill', d => {
        // update bubble colors here based on vote option
        return '#888';
      });

    node
      .append('text')
      .attr('dy', '.2em')
      .style('text-anchor', 'middle')
      .text(function (d) {
        // check for mapped delegate name here;
        return cutMiddle(d.data.voter);
      })
      .attr('font-size', function (d) {
        return d.r / 4;
      })
      // add font color
      .attr('fill', '#FFF');

    select(self.frameElement).style('height', `${diameter}px`);
  }, [tally, diameter]);

  return (
    <Box>
      <svg ref={ref} />
    </Box>
  );
};

type Props = {
  poll: Poll;
  tally: PollTally;
};

const VoteWeightVisual = ({ poll, tally }: Props): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(500);

  useEffect(() => {
    setWidth(ref.current ? ref.current.offsetWidth : 300);
  }, [ref.current]);

  return (
    <div ref={ref}>
      <CirclesSvg diameter={width} poll={poll} tally={tally} />
    </div>
  );
};

export default VoteWeightVisual;
