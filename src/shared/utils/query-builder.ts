// Placeholder for query building utility functions
export const constructFilter = (field: string, value: any): object => {
  return { term: { [field]: value } };
};
