export type QrEncodeResult = {
  data: boolean[][]
  types: number[][]
  size: number
  version: number
  maskPattern: number
}

export function encode(
  data: string | number[],
  options?: {
    ecc?: "L" | "M" | "Q" | "H"
    boostEcc?: boolean
    minVersion?: number
    maxVersion?: number
    maskPattern?: number
    border?: number
    invert?: boolean
  }
): QrEncodeResult

export const QrCodeDataType: {
  Border: number
  Data: number
  Function: number
  Position: number
  Timing: number
  Alignment: number
}
