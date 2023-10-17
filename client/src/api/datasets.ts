import type { FetchArgType } from "openapi-typescript-fetch";

import { fetcher } from "@/api/schema";
import { withPrefix } from "@/utils/redirect";

export const datasetsFetcher = fetcher.path("/api/datasets").method("get").create();

type GetDatasetsApiOptions = FetchArgType<typeof datasetsFetcher>;
type GetDatasetsQuery = Pick<GetDatasetsApiOptions, "limit" | "offset">;
// custom interface for how we use getDatasets
interface GetDatasetsOptions extends GetDatasetsQuery {
    sortBy?: string;
    sortDesc?: string;
    query?: string;
}

/** Datasets request helper **/
export async function getDatasets(options: GetDatasetsOptions = {}) {
    const params: GetDatasetsApiOptions = {};
    if (options.sortBy) {
        const sortPrefix = options.sortDesc ? "-dsc" : "-asc";
        params.order = `${options.sortBy}${sortPrefix}`;
    }
    if (options.limit) {
        params.limit = options.limit;
    }
    if (options.offset) {
        params.offset = options.offset;
    }
    if (options.query) {
        params.q = ["name-contains"];
        params.qv = [options.query];
    }
    const { data } = await datasetsFetcher(params);
    return data;
}

const updateHistoryDataset = fetcher.path("/api/histories/{history_id}/contents/{type}s/{id}").method("put").create();

export async function undeleteHistoryDataset(historyId: string, datasetId: string) {
    const { data } = await updateHistoryDataset({
        history_id: historyId,
        id: datasetId,
        type: "dataset",
        deleted: false,
    });
    return data;
}

const deleteHistoryDataset = fetcher
    .path("/api/histories/{history_id}/contents/{type}s/{id}")
    .method("delete")
    .create();

export async function purgeHistoryDataset(historyId: string, datasetId: string) {
    const { data } = await deleteHistoryDataset({ history_id: historyId, id: datasetId, type: "dataset", purge: true });
    return data;
}

const datasetCopy = fetcher.path("/api/histories/{history_id}/contents/{type}s").method("post").create();
type HistoryContentsArgs = FetchArgType<typeof datasetCopy>;
export async function copyDataset(
    datasetId: HistoryContentsArgs["content"],
    historyId: HistoryContentsArgs["history_id"],
    type: HistoryContentsArgs["type"] = "dataset",
    source: HistoryContentsArgs["source"] = "hda"
) {
    const response = await datasetCopy({
        history_id: historyId,
        type,
        source: source,
        content: datasetId,
    });
    return response.data;
}

const tagsUpdater = fetcher.path("/api/tags").method("put").create();
type UpdateTagsArgs = FetchArgType<typeof tagsUpdater>;
export async function updateTags(
    itemId: UpdateTagsArgs["item_id"],
    itemClass: UpdateTagsArgs["item_class"],
    itemTags: UpdateTagsArgs["item_tags"]
) {
    const { data } = await tagsUpdater({
        item_id: itemId,
        item_class: itemClass,
        item_tags: itemTags,
    });
    return data;
}

export function getCompositeDatasetLink(historyDatasetId: string, path: string) {
    return withPrefix(`/api/datasets/${historyDatasetId}/display?filename=${path}`);
}
