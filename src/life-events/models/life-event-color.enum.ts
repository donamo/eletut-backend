import { registerEnumType } from '@nestjs/graphql';

export enum LifeEventColor {
  RED = 'RED',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  ORANGE = 'ORANGE',
  PURPLE = 'PURPLE',
  PINK = 'PINK',
  BROWN = 'BROWN',
  BLACK = 'BLACK',
  WHITE = 'WHITE',
  GRAY = 'GRAY',
  CYAN = 'CYAN',
  MAGENTA = 'MAGENTA',
  LIME = 'LIME',
  INDIGO = 'INDIGO',
  TEAL = 'TEAL',
}

registerEnumType(LifeEventColor, { name: 'LifeEventColor' });
