//
//  _   _        __  __                          ____          _      
// | | | |_   _ / _|/ _|_ __ ___   __ _ _ __    / ___|___   __| | ___ 
// | |_| | | | | |_| |_| '_ ` _ \ / _` | '_ \  | |   / _ \ / _` |/ _ \
// |  _  | |_| |  _|  _| | | | | | (_| | | | | | |__| (_) | (_| |  __/
// |_| |_|\__,_|_| |_| |_| |_| |_|\__,_|_| |_|  \____\___/ \__,_|\___|
//                                                                    
//     _    _                  _ _   _               
//    / \  | | __ _  ___  _ __(_) |_| |__  _ __ ___  
//   / _ \ | |/ _` |/ _ \| '__| | __| '_ \| '_ ` _ \ 
//  / ___ \| | (_| | (_) | |  | | |_| | | | | | | | |
// /_/   \_\_|\__, |\___/|_|  |_|\__|_| |_|_| |_| |_|
//            |___/                  
//
//

// If you want to learn this Algorithm, please look at: https://www.mnc.toho-u.ac.jp/v-lab/yobology/Huffman_code/Huffman_code.htm

interface NumberValueObject {
  [key: string]: number;
}

interface StringValueObject {
  [key: string]: string;
}

type LetterDistribution = NumberValueObject;

type AppearanceArray = AppearanceItem[];

interface AppearanceItem {
  symbol: Symbols;
  p: number;
}

type Symbols = string | any;

type BinaryTreeSymbols = Symbols;

interface Appearance {
  [key: string]: AppearanceItem;
}

type EncodedMap = StringValueObject;

interface HuffmanProps {
  letterDistribution: LetterDistribution;
  appearance: Appearance;
  packedAppearance: BinaryTreeSymbols;
  encodedMap: EncodedMap;
}

interface CreateHuffmanProps {
  letterDistribution: LetterDistribution
}

class Huffman {
  // 文字と出現数の関係を表すオブジェクト
  public readonly letterDistribution: LetterDistribution;

  // 各文字の出現'率'の関係を表すオブジェクト
  public readonly appearance: Appearance;

  // 出現率の大小関係から生成するバイナリツリー表現の配列
  // ex). ["A",["B",[["C","D"],["E",["F",["G","H"]]]]]]
  public readonly packedAppearance: BinaryTreeSymbols;

  // HuffmanCodeに変換済みのデータ
  public readonly encodedMap: EncodedMap;

  private constructor (props: HuffmanProps) {
    this.letterDistribution = props.letterDistribution;
    this.appearance = props.appearance;
    this.packedAppearance = props.packedAppearance;
    this.encodedMap = props.encodedMap;
  }

  public static toEncodeMap: EncodedMap = {};

  // 文字の出現回数分の文字を生成し、それらを要素とする配列を生成
  public static createChars(letterDistribution: LetterDistribution): string[] {
    const chars: string[] = Object.keys(letterDistribution).flatMap((c: string) => {
      return [...Array(letterDistribution[c]).keys()].map(() => c);
    });

    return chars;
  }

  // 各文字の出現'率'の関係を表すオブジェクトを生成
  public static createAppearance(chars: string[]): Appearance {
    const appearance: Appearance = {};
    const sententLength: number = chars.length;

    // 各文字の出現回数をカウント
    chars.forEach(c => appearance[c] !== undefined ? appearance[c].p += 1 : appearance[c] = {symbol: c, p: 1});

    // 各文字の出現率を計算
    Object.keys(appearance).forEach(c => appearance[c].p /= sententLength);

    return appearance;
  }

  // 出現率の大小関係から生成するバイナリツリー表現の配列を生成
  public static createPackedAppearance(appearance: Appearance): BinaryTreeSymbols {
    const sortedAppearance: AppearanceArray = Object.values(appearance).sort((a,b) => b.p - a.p);

    while (sortedAppearance.length !== 1) {
      const minest: AppearanceItem = sortedAppearance.reduce((a,b) => a.p < b.p ? a : b);
      const minestIndex: number = sortedAppearance.indexOf(minest);
      sortedAppearance.splice(minestIndex,1);

      const miner: AppearanceItem = sortedAppearance.reduce((a,b) => a.p < b.p ? a : b);
      const minerIndex: number = sortedAppearance.indexOf(miner);
      sortedAppearance.splice(minerIndex,1);

      const arrayLenght: number = sortedAppearance.length;

      const symbol: Symbols = !Array.isArray(minest.symbol) && Array.isArray(miner.symbol) ?
        [minest.symbol, miner.symbol] : [miner.symbol, minest.symbol];

      const p: number = ( minest.p*100 + miner.p*100 ) / 100;

      sortedAppearance[arrayLenght] = {symbol, p};
    }

    return sortedAppearance[0].symbol;
  }

  // バイナリツリーに対して、再起的にバイナリを割り当てて符号化していくメソッド
  public static diver(symbols: Symbols, binary: string): void {

    if (!Array.isArray(symbols)) {
      throw new Error("'symbols' is not 'Array', expected 'Array'.");
    }

    const firstSymbolIsArray: boolean = Array.isArray(symbols[0]);
    const secondSymbolIsArray: boolean = Array.isArray(symbols[1]);

    if (!firstSymbolIsArray) {
      this.toEncodeMap[symbols[0]] = binary + "1";
    }
    if (!firstSymbolIsArray && !secondSymbolIsArray) {
      this.toEncodeMap[symbols[1]] = binary + "0";
      return;
    }
    if (!firstSymbolIsArray && secondSymbolIsArray) {
      return this.diver(symbols[1], binary + "0")
    }

    return this.diver(symbols[0], binary + "1"), this.diver(symbols[1], binary + "0");
  }

  // 符号化をするための前段となるメソッド
  public static encode(packedAppearance: AppearanceArray): EncodedMap {
    const firstBinary: string = "";

    this.toEncodeMap = {};

    this.diver(packedAppearance, firstBinary);

    return this.toEncodeMap;
  }

  // 新しいHuffmanクラスを生成するメソッド
  public static createNew(props: CreateHuffmanProps): Huffman {
    const letterDistribution: LetterDistribution = props.letterDistribution;
    const chars: string[] = this.createChars(letterDistribution);
    const appearance: Appearance = this.createAppearance(chars);
    const packedAppearance: AppearanceArray = this.createPackedAppearance(appearance);
    const encodedMap: EncodedMap = this.encode(packedAppearance);

    console.log(letterDistribution, chars, appearance, JSON.stringify(packedAppearance), encodedMap);

    return new Huffman({
      letterDistribution,
      appearance,
      packedAppearance,
      encodedMap,
    });
  }
}


const letterDistribution: LetterDistribution = {
  "A": 50,
  "B": 20,
  "C": 10,
  "D": 8,
  "E": 5,
  "F": 4,
  "G": 2,
  "H": 1,
};

const huffman: Huffman = Huffman.createNew({letterDistribution});

console.log(huffman.encodedMap);
