import request from "@/utils/request"
import { History } from "@/types/History"

export function getHistory() {
  return Promise.resolve([
    {
      operationId: 0,
      time: new Date().getTime() - 2000000,
      operator: "Br",
      operationName: "Import",
    },
    {
      operationId: 1,
      operationName: "Fillet",
      time: new Date().getTime(),
      operator: "Br",
      operationSubmitValues: {
        choosedIdList: ["fakeId"],
        choosedTypeList: ["edge"],
        props: {
          Radius: 1,
        },
      },
    },
  ] as History[])
}
