// import { IOperation } from 'operations/i_operation';
// import { IOperationContext } from 'operations/i_operation_context';
//
// export class ContextEx {
//   static async tryStartInEnvironment(
//     operationType: any,
//     rootContext: IOperationContext,
//     currentEnvironment: IExecutionEnvironment,
//     pars?: Array<any>
//   ): Promise<IOperation> {
//     return ContextEx.tryStartInContext(
//       operationType,
//       rootContext,
//       currentEnvironment ? currentEnvironment.context : null,
//       pars
//     );
//   }
//
//   static async tryStartInContext(
//     operationType: any,
//     rootContext: IOperationContext,
//     context: IOperationContext,
//     params?: Array<any>
//   ): Promise<IOperation> {
//     if (context) {
//       return await context.startOperationByType(operationType, params);
//     }
//     return await rootContext.startChildOperationByType(operationType, params);
//   }
// }
