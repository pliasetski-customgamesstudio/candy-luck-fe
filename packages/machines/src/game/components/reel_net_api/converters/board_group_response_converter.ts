// import { InternalBoardSpecGroup, InternalBoardUpdate, InternalBoard, InternalUpdateInclude } from 'path/to/reels_engine_library';
// import { ResponseConverter } from 'path/to/common';

// export class BoardGroupResponseConverter implements ResponseConverter<Map, InternalBoardSpecGroup> {
//   constructor() {}

//   ConvertObject(group: Map): InternalBoardSpecGroup {
//     if (!group) {
//       return null;
//     }

//     const result: InternalBoardSpecGroup = new InternalBoardSpecGroup();

//     result.tokens = group.get("tokens");
//     result.nextTokens = group.get("nextTokens");
//     result.avatarId = group.get("avatarId");
//     result.avatarInit = group.get("avatarInit");
//     result.avatarPosition = group.get("avatarPosition");
//     result.board = this.generateBoard(group.get("board") as Map[]);
//     result.nextBoard = this.generateBoard(group.get("nextBoard") as Map[]);
//     result.update = this.generateUpdate(group.get("updates") as Map[]);
//     result.attributes = this.generateBoard(group.get("attributes") as Map[]);

//     return result;
//   }

//   generateUpdate(group: Map[]): InternalBoardUpdate[] {
//     if (!group || group.length == 0) {
//       return null;
//     }
//     const list: InternalBoardUpdate[] = [];
//     for (const board of group) {
//       const obj: InternalBoardUpdate = new InternalBoardUpdate();
//       obj.type = board.get("type");
//       obj.subType = board.get("subType");
//       obj.id = board.get("id");
//       obj.value = board.get("value");
//       obj.value2 = board.get("value2");
//       obj.include = this.generateIncludes(board.get("include") as Map[]);
//       list.push(obj);
//     }
//     return list;
//   }

//   generateBoard(group: Map[]): InternalBoard[] {
//     if (!group || group.length == 0) {
//       return null;
//     }
//     const list: InternalBoard[] = [];
//     for (const board of group) {
//       const obj: InternalBoard = new InternalBoard();
//       obj.coins = board.get("coins");
//       obj.subType = board.get("subType");
//       obj.token = board.get("token");
//       obj.type = board.get("type");
//       list.push(obj);
//     }
//     return list;
//   }

//   generateIncludes(includes: Map[]): InternalUpdateInclude[] {
//     if (!includes || includes.length == 0) {
//       return null;
//     }
//     const list: InternalUpdateInclude[] = [];
//     for (const boardUpdateInclude of includes) {
//       const obj: InternalUpdateInclude = new InternalUpdateInclude();
//       obj.subType = boardUpdateInclude.get("subType");
//       obj.id = boardUpdateInclude.get("id");
//       obj.type = boardUpdateInclude.get("type");
//       obj.value = boardUpdateInclude.get("value");
//       obj.value2 = boardUpdateInclude.get("value2");
//       obj.include = this.generateIncludes(boardUpdateInclude.get("include") as Map[]);
//       list.push(obj);
//     }
//     return list;
//   }
// }
