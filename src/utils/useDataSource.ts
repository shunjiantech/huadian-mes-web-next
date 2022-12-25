// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSyncDataSource = (dataSource: unknown) => (field: any) => {
  field.dataSource = dataSource
}
