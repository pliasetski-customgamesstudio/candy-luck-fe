// class GameListHolder implements ILobbyArenaHolder {
//   private _eventDispatcher: EventDispatcher = new EventDispatcher();

//   private _lobby: GameConfigDTO;
//   private _lastRefresh: Date;

//   get lobby(): GameConfigDTO {
//     return this._lobby;
//   }

//   getMachineById(machineId: string): Machine {
//     if (!this._lobby || !this._lobby.rooms) {
//       return null;
//     }

//     for (let room of this._lobby.rooms) {
//       for (let game of room.games) {
//         if (game.id == machineId) return game;
//       }
//     }

//     return null;
//   }

//   forceLobbyChange(): void {
//     this._eventDispatcher.dispatchEvent();
//   }

//   getDefaultRoom(): RoomDTO {
//     return this._lobby.rooms.find((r) => r.title == "Default");
//   }

//   getHighRollerRoom(): RoomDTO {
//     return this._lobby.rooms.find((r) => r.title == "High Roller Room") || null;
//   }

//   getHighRollerBank(): RoomDTO {
//     return this._lobby.rooms.find((r) => r.title == "High Roller Bank") || null;
//   }

//   allRoomsGames(): Machine[] {
//     let games = this._lobby.rooms
//       .filter((p) => !!p.games)
//       .flatMap((p) => p.games);
//     let favoriteGamesToAdd = this._lobby.rooms
//       .filter((p) => !!p.favoriteGames)
//       .flatMap((p) => p.favoriteGames);

//     games.push(...favoriteGamesToAdd);

//     let groupedGames: Machine[] = [];
//     for (let game of games) {
//       let gameIsAdded = groupedGames.some((p) => p.id == game.id && p.sizeType == game.sizeType);
//       if (gameIsAdded) continue;

//       groupedGames.push(game);
//     }

//     return games;
//   }

//   isHighRollerGame(machineId: string): boolean {
//     let isMainHighRollerGame = this.getHighRollerRoom()?.games?.some((e) => e.id == machineId) ?? false;
//     let isHighRollerBank = this.getHighRollerBank()?.games?.some((e) => e.id == machineId) ?? false;
//     return isMainHighRollerGame || isHighRollerBank;
//   }

//   isHighRollerBank(machineId: string): boolean {
//     return this.getHighRollerBank()?.games?.some((e) => e.id == machineId) ?? false;
//   }

//   get lobbyChanged(): Stream {
//     return this._eventDispatcher.eventStream;
//   }

//   get lastRefresh(): Date {
//     return this._lastRefresh;
//   }

//   resetData(): void {
//     this._lastRefresh = null;
//   }

//   set lobby(lobby: GameConfigDTO) {
//     this._lastRefresh = new Date();
//     this._lobby = lobby;

//     if (this._lobby && this._lobby.rooms) {
//       for (let room of this._lobby.rooms) {
//         if (room.games) {
//           room.games.sort(this.compare);
//         }
//       }
//     }
//     this._eventDispatcher.dispatchEvent();
//   }

//   private compare(x: Machine, y: Machine): number {
//     let result = x.position - y.position;
//     if (result != 0) {
//       return result;
//     }
//     return parseInt(x.id) - parseInt(y.id);
//   }
// }
