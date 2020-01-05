declare function out(sig: i32 | null): void;
let i: i32 | null = 0;
export function randomCall(): void {
  out(i++);
}
out(2);
randomCall();