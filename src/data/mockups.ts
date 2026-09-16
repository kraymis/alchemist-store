import blackFront from '../assets/t-shirtblack.png'
import blackBack from '../assets/t-shirtblackback.png'
import whiteFront from '../assets/t-shirtwhite.png'
import whiteBack from '../assets/tshirtwhiteback.png'
import redFront from '../assets/tshirtred.png'
import redBack from '../assets/tshirtredback.png'
import blueFront from '../assets/tshirtblue.png'
import blueBack from '../assets/tshirtblueback.png'
import greenFront from '../assets/tshirtgreen.png'
import greenBack from '../assets/tshirtgreenback.png'

export type TshirtMockup = {
  id: string;
  name: string;
  color: string;
  frontImage: string;
  backImage: string;
}

export const tshirtMockups: TshirtMockup[] = [
  {
    id: 'black',
    name: 'Noir',
    color: '#111111',
    frontImage: blackFront,
    backImage: blackBack,
  },
  {
    id: 'white',
    name: 'Blanc',
    color: '#ffffff',
    frontImage: whiteFront,
    backImage: whiteBack,
  },
  {
    id: 'red',
    name: 'Rouge',
    color: '#c62828',
    frontImage: redFront,
    backImage: redBack,
  },
  {
    id: 'blue',
    name: 'Bleu',
    color: '#2563eb',
    frontImage: blueFront,
    backImage: blueBack,
  },
  {
    id: 'green',
    name: 'Vert',
    color: '#16803c',
    frontImage: greenFront,
    backImage: greenBack,
  },
]
