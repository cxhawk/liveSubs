import { Converter } from 'opencc-js';

class ChineseConverter {
  constructor() {
    this.converters = {};
    this.initializeConverters();
  }

  initializeConverters() {
    try {
      this.converters.s2t = Converter({ from: 'cn', to: 'tw' });
      this.converters.t2s = Converter({ from: 'tw', to: 'cn' });
    } catch (error) {
      console.error('Failed to initialize Chinese converters:', error);
      this.converters = {};
    }
  }

  convert(text, conversionType) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    if (conversionType === 'none' || !conversionType) {
      return text;
    }

    try {
      const converter = this.converters[conversionType];
      if (!converter) {
        console.warn(`Chinese converter for type '${conversionType}' not available`);
        return text;
      }

      return converter(text);
    } catch (error) {
      console.error(`Chinese conversion failed for type '${conversionType}':`, error);
      return text;
    }
  }
}

const chineseConverter = new ChineseConverter();

export default chineseConverter;