interface QuranAPIResponse {
  code: number;
  status: string;
  data: any;
}

const API_BASE_URL = 'https://api.alquran.cloud/v1';
const AUDIO_BASE_URL = 'https://cdn.islamic.network/quran/audio';

export interface QuranWord {
  text: string;
  translation: string;
  transliteration: string;
  audioTimestamp?: number;
}

export interface QuranVerse {
  number: number;
  text: string;
  translation: string;
  audio: string;
  words: QuranWord[];
}

export interface QuranChapter {
  id: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfVerses: number;
  revelationType: string;
}

class QuranAPIService {
  private async fetchAPI(endpoint: string): Promise<QuranAPIResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching from Quran API:', error);
      throw error;
    }
  }

  async getChapters(): Promise<QuranChapter[]> {
    const response = await this.fetchAPI('/surah');
    return response.data;
  }

  async getChapter(chapterId: number): Promise<QuranChapter> {
    const response = await this.fetchAPI(`/surah/${chapterId}`);
    return response.data;
  }

  async getVerses(chapterId: number): Promise<QuranVerse[]> {
    const [arabicResponse, translationResponse, wordByWordResponse] = await Promise.all([
      this.fetchAPI(`/surah/${chapterId}`),
      this.fetchAPI(`/surah/${chapterId}/en.asad`),
      this.fetchAPI(`/surah/${chapterId}/en.wordbyword`)
    ]);

    const verses = arabicResponse.data.ayahs.map((ayah: any, index: number) => {
      const translation = translationResponse.data.ayahs[index];
      const wordByWord = wordByWordResponse.data.ayahs[index];

      return {
        number: ayah.numberInSurah,
        text: ayah.text,
        translation: translation.text,
        audio: `${AUDIO_BASE_URL}/64/arabic/${ayah.number}.mp3`,
        words: wordByWord.words.map((word: any) => ({
          text: word.text,
          translation: word.translation.text,
          transliteration: word.transliteration.text,
        })),
      };
    });

    return verses;
  }

  async searchPattern(pattern: string): Promise<any[]> {
    // This would be implemented to search for specific patterns in the Quran
    // You might want to use a different API or implement your own search logic
    return [];
  }

  getAudioUrl(verseKey: string): string {
    return `${AUDIO_BASE_URL}/64/arabic/${verseKey}.mp3`;
  }
}

export const quranAPI = new QuranAPIService();
