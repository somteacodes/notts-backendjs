import dayjs, { Dayjs, ManipulateType } from "dayjs";

const digits = '0123456789';

export const generateOTP=(numOfDigits:number=4):string=> {
    let OTP = '';
    for (let i = 0; i < numOfDigits; i++) {
        OTP += digits[Math.floor(Math.random() * digits.length)];
    }
    return OTP;
}
 

// TIME AND DAY JS
 
 

export const addTime = (duration: number, type: ManipulateType  = 'hour', currentDate:Dayjs = dayjs()): string => {
  const newDate = currentDate.add(duration, type).toString();
  return newDate;
}

export const timeDiff=(beforeDate:Dayjs, afterDate:Dayjs, type: ManipulateType  = 'seconds')=>{
  return beforeDate.diff(afterDate, type)
}
