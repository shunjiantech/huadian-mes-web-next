// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSyncDataSource = (dataSource: unknown) => (field: any) => {
  console.log(dataSource)
  field.dataSource = dataSource
}
