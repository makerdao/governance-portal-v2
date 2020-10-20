import { keyframes } from '@emotion/core';

export const fadeIn = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`;

export const slideUp = keyframes`
  0%   { 
    opacity: .5; 
    -webkit-transform: translateY(75px);
    -moz-transform: translateY(75px);
    -o-transform: translateY(75px);
    transform:  translateY(75px);
  }
  100% { 
    opacity: 0.75; 
    -webkit-transform: translateY(0%); 
    -moz-transform: translateY(0%); 
    -o-transform: translateY(0%); 
    transform:  translateY(0%); 
  }
`;
