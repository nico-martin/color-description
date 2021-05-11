import chroma from 'chroma-js';

// https://grammar.yourdictionary.com/grammar/word-lists/list-of-words-to-describe-colors.html
// https://www.writerswrite.co.za/204-words-that-describe-colours/

const cmyk2cmy = cmyk => {
  const [c, m, y, k] = cmyk;
  return [c + k, m + k, y + k]
};

const isInRange = (x, min, max) => (x >= min && x <= max);

const HSLadjectives = [
  {
    criteria: {
      hsl: [null, [0.75, 1], [0.4, 0.55]],
    },
    adjecives: [
      'saturated', 
      'strong', 
      'lush', 
      'ablaze', 
      'beaming', 
      'bold', 
      'brilliant', 
      'flamboyant',
      'vibrant',
      'vivid',
      'loud'
    ],
  },
  {
    criteria: {
      hsl: [null, null, [0, 0.07]],
    },
    adjecives: [
      'dark', 
      'dull', 
      'ashy', 
      'somber', 
      'bleak', 
      'dim', 
      'muddy', 
      'gloomy', 
      'sooty'
    ],
  },
  {
    criteria: {
      hsl: [null, [0.12, 1], [0.7, 1]],
    },
    adjecives: [
      'tinted'
    ],
  },
  {
    criteria: {
      hsl: [null, null, [0.88, 1]],
    },
    adjecives: [
      'pale', 
      'light', 
      'faded', 
      'delicate',
      'glistening'
    ],
  },
  {
    criteria: {
      hsl: [null, [0.5, 1], [0.7, 0.9]],
    },
    adjecives: [
      'fresh',
      'sparkling',
      'glittering',
      'glowing',
      'jazzy',
      'opalecent'
    ],
  },
  {
    criteria: {
      hsl: [null, null, [0.9, 1]],
    },
    adjecives: ['neutral'],
  },
  {
    criteria: {
      hsl: [null, [0.74, 1], [0.9, 1]],
    },
    adjecives: [
      'muted'
    ],
  },
  {
    criteria: {
      hsl: [null, null, 1],
    },
    adjecives: [
      'colorless', 
      'bright', 
      'briliant', 
      'high'
    ],
  },
  {
    criteria: {
      hsl: [null, null, 0],
    },
    adjecives: [
      'colorless', 
      'low',
      'dark'
    ],
  },
];

const HSLhue = [
  {
    range: [349, 11], 
    name: 'red',
  },
  {
    range: [11, 37], 
    name: 'orange ',
  }
]

const temperatures = [
  {
    value: 1800,
    adjecives: [
      'ultra warm',
    ]
  },
  {
    value: 2400,
    adjecives: [
      'very warm',
    ]
  },
  {
    value: 2700,
    adjecives: [
      'warm',
    ]
  },
  {
    value: 3000,
    adjecives: [
      'warm white',
    ]
  },
  {
    value: 4000,
    adjecives: [
      'cool or cold',
    ]
  },
  {
    value: 6500,
    adjecives: [
      'cool',
    ]
  }
];

export default class ColorDescription {
  constructor (color) {
    this.color = color;
  }

  set color (color) {
    this.currentColor = this.#parseColor(color)
  }

  get color () {
    return this.currentColor;
  }

  #parseColor (color) {
    if (chroma.valid(color)) {
      return chroma(color); 
    } else {
      throw new TypeError('Color is not a valid color, check the chroma.js documentation.', 'color-description', 14);
    }
  }

  get temeratureAdjectives () {
    const goal = this.color.temperature();
    return temperatures.reduce((prev, curr) =>
      (Math.abs(curr.value - goal) < Math.abs(prev.value - goal) ? curr : prev)
    , {value: 0});
  }

  get rgbPercentages () {
    const gl = this.color.gl();
    gl.pop() // removes alpha
    const total = gl.reduce((r,d) => r + d, 0);
    return gl.map(c => c/total);
  }

  get adjectivesList () {
    const arr = [...this.adjectives];

    if (arr.length > 1) {
      const last = arr.pop()
      return `${arr.join(', ')} and ${last}`;
    } else {
      return arr[0];
    }
  }

  get adjectives () {
    const hsl = this.color.hsl();

    return HSLadjectives.reduce((rem, current) => {
      //console.log(rem, current);
      const colorModels = Object.keys(current.criteria);
      const matchesEveryCriteria = colorModels.every(colorModel => {

        const colorAsModel = this.color[colorModel]();
        colorAsModel.pop() // removes alpha
        
        return current.criteria[colorModel].every((criterium, i) => {
          if (criterium === null) {
            return true;
          } else if (Array.isArray(criterium)) {
            return isInRange(colorAsModel[i],criterium[0], criterium[1]); 
          } else if (!isNaN(criterium)) {
            return colorAsModel[i] === criterium;
          } else {
            return false;
          }
        });
      });

      if (matchesEveryCriteria) {
        return [...rem, ...current.adjecives];
      } else {
        return rem;
      }
    },[]);
  }
}
