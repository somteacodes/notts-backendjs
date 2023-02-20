type Bank = { name: string; code: string };

const banks: Bank[] = [
  { name: 'ACCESS BANK', code: '044' },
  { name: 'CITIBANK', code: '023' },
  { name: 'DIAMOND BANK', code: '063' },
  { name: 'ECOBANK NIGERIA', code: '050' },
  { name: 'FIDELITY BANK', code: '070' },
  { name: 'FIRST BANK OF NIGERIA', code: '011' },
  { name: 'FIRST CITY MONUMENT BANK', code: '214' },
  { name: 'GUARANTY TRUST BANK', code: '058' },
  { name: 'HERITAGE BANK', code: '030' },
  { name: 'JAIZ BANK', code: '301' },
  { name: 'KEYSTONE BANK', code: '082' },
  { name: 'PROVIDUS BANK', code: '101' },
  { name: 'SKYE BANK', code: '076' },
  { name: 'STANBIC IBTC BANK', code: '221' },
  { name: 'STANDARD CHARTERED BANK', code: '068' },
  { name: 'STERLING BANK', code: '232' },
  { name: 'SUNTRUST', code: '100' },
  { name: 'UNION BANK OF NIGERIA', code: '032' },
  { name: 'UNITED BANK FOR AFRICA', code: '033' },
  { name: 'UNITY BANK', code: '215' },
  { name: 'WEMA BANK', code: '035' },
  { name: 'ZENITH BANK', code: '057' },
];

const seed = '373373373373';
const nubanLength = 10;
const serialNumLength = 9;

const isBankAccountValid = (accountNumber: string, bankCode: string) => {
  if (!accountNumber || accountNumber.length !== nubanLength) {
    return false;
  }

  const serialNumber = accountNumber.substring(0, serialNumLength);
  const checkDigit = generateCheckDigit(serialNumber, bankCode);

  return checkDigit === parseInt(accountNumber[serialNumLength], 10);
};

const generateCheckDigit = (serialNumber: string, bankCode: string) => {
  if (serialNumber.length > serialNumLength) {
    throw new Error(`Serial number should be at most ${serialNumLength}-digits long.`);
  }

  const cipher = bankCode + serialNumber;
  let sum = 0;

  for (let i = 0; i < cipher.length; i++) {
    sum += parseInt(cipher[i], 10) * parseInt(seed[i], 10);
  }

  sum %= 10;

  let checkDigit = 10 - sum;
  checkDigit = checkDigit === 10 ? 0 : checkDigit;

  return checkDigit;
};

export const getPossibleBanks = async (nuban: string): Promise<Bank[]> => {
  const accountBanks: Bank[] = [];

  for (const bank of banks) {
    if (isBankAccountValid(nuban, bank.code)) {
      accountBanks.push(bank);
    }
  }

  return await accountBanks;
};
 