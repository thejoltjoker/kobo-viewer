import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, r => ({
  koboPlusAssets: {
    koboPlusAssetGroup: r.one.koboPlusAssetGroup({
      from: r.koboPlusAssets.assetGroupId,
      to: r.koboPlusAssetGroup.id,
    }),
  },
  koboPlusAssetGroup: {
    koboPlusAssets: r.many.koboPlusAssets(),
  },
}));
