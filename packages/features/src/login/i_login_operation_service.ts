export const T_ILoginOperationService = Symbol('ILoginOperationService');
export interface ILoginOperationService {
  authorize(): Promise<void>;
}
