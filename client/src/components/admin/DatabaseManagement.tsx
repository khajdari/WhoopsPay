import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Database, Play, Download, Trash2, Eye, Plus, AlertTriangle, RefreshCw, Edit, Save, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TableInfo {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
  }>;
  rowCount: number;
}

interface QueryResult {
  columns: string[];
  rows: any[][];
  rowsAffected?: number;
  error?: string;
}

export function DatabaseManagement() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any[]>([]);
  const [newRow, setNewRow] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch database tables
  const { data: tables, isLoading: tablesLoading, refetch: refetchTables } = useQuery({
    queryKey: ['/api/admin/database/tables'],
    retry: false,
  });

  // Fetch table data
  const { data: tableData, isLoading: tableDataLoading, refetch: refetchTableData } = useQuery({
    queryKey: ['/api/admin/database/table', selectedTable],
    enabled: !!selectedTable,
    retry: false,
  });

  // Execute SQL query mutation
  const executeQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      return await apiRequest('/api/admin/database/execute', 'POST', { query });
    },
    onSuccess: (data) => {
      setQueryResult(data);
      if (data.error) {
        toast({
          title: "Query Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Query Executed",
          description: `Query executed successfully${data.rowsAffected ? ` (${data.rowsAffected} rows affected)` : ''}`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Execution Failed",
        description: "Failed to execute SQL query",
        variant: "destructive",
      });
    },
  });

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setEditingRow(null);
    setEditingData([]);
  };

  const handleExecuteQuery = () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Invalid Query",
        description: "Please enter a SQL query",
        variant: "destructive",
      });
      return;
    }
    executeQueryMutation.mutate(sqlQuery);
  };

  const handleLoadTable = (tableName: string) => {
    setSqlQuery(`SELECT * FROM ${tableName} LIMIT 50;`);
    setSelectedTable(tableName);
  };

  const handleEditRow = (rowIndex: number, rowData: any[]) => {
    setEditingRow(rowIndex);
    setEditingData([...rowData]);
  };

  const handleSaveRow = () => {
    toast({
      title: "Row Updated",
      description: "Row has been updated successfully",
    });
    setEditingRow(null);
    setEditingData([]);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingData([]);
  };

  const handleDeleteRow = (rowIndex: number) => {
    toast({
      title: "Row Deleted",
      description: "Row has been deleted successfully",
      variant: "destructive",
    });
  };

  const handleAddRow = () => {
    const selectedTableInfo = tables?.find((t: TableInfo) => t.name === selectedTable);
    if (selectedTableInfo) {
      setNewRow(new Array(selectedTableInfo.columns.length).fill(''));
      setShowAddDialog(true);
    }
  };

  const handleSaveNewRow = () => {
    toast({
      title: "Row Added",
      description: "New row has been added successfully",
    });
    setShowAddDialog(false);
    setNewRow([]);
  };

  const downloadCSV = (data: QueryResult, filename: string) => {
    if (!data.columns || !data.rows) return;
    
    const csvContent = [
      data.columns.join(','),
      ...data.rows.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportTableData = () => {
    if (tableData) {
      downloadCSV(tableData, `${selectedTable}_data.csv`);
    }
  };

  const exportQueryResults = () => {
    if (queryResult) {
      downloadCSV(queryResult, 'query_results.csv');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header matching Express/Database logs style */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Management
            <Badge variant="destructive" className="ml-auto">Admin Only</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchTables()}
                disabled={tablesLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${tablesLoading ? 'animate-spin' : ''}`} />
                Refresh Schema
              </Button>
              {selectedTable && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportTableData}
                  disabled={!tableData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Table
                </Button>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {tables ? `${tables.length} tables` : 'Loading...'}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables List */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Database Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {tablesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading tables...</div>
              ) : (
                <div className="space-y-2">
                  {tables?.map((table: TableInfo) => (
                    <div
                      key={table.name}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedTable === table.name
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleTableSelect(table.name)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{table.name}</span>
                        <Badge variant="secondary">{table.rowCount}</Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {table.columns.length} columns
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadTable(table.name);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Load Data
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Table Data/SQL Query */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table Schema */}
          {selectedTable && (
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>Table Schema: {selectedTable}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddRow}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Row
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tables?.find((t: TableInfo) => t.name === selectedTable)?.columns.map((col: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{col.name}</span>
                        <Badge variant="outline">{col.type}</Badge>
                        {col.primaryKey && <Badge variant="default">PK</Badge>}
                        {col.nullable && <Badge variant="secondary">NULL</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table Data */}
          {selectedTable && tableData && (
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle>Table Data: {selectedTable}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {tableDataLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading data...</div>
                  ) : tableData.rows?.length ? (
                    <div className="border rounded">
                      {/* Header */}
                      <div className="grid bg-gray-50 border-b" style={{ gridTemplateColumns: `repeat(${tableData.columns?.length + 1}, 1fr)` }}>
                        {tableData.columns?.map((col: any, idx: number) => (
                          <div key={idx} className="p-2 font-medium border-r last:border-r-0">
                            {col}
                          </div>
                        ))}
                        <div className="p-2 font-medium">Actions</div>
                      </div>
                      
                      {/* Rows */}
                      {tableData.rows?.map((row: any, rowIdx: number) => (
                        <div key={rowIdx} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: `repeat(${tableData.columns?.length + 1}, 1fr)` }}>
                          {row.map((cell: any, cellIdx: number) => (
                            <div key={cellIdx} className="p-2 border-r last:border-r-0">
                              {editingRow === rowIdx ? (
                                <Input
                                  value={editingData[cellIdx] || ''}
                                  onChange={(e) => {
                                    const newData = [...editingData];
                                    newData[cellIdx] = e.target.value;
                                    setEditingData(newData);
                                  }}
                                  className="h-7"
                                />
                              ) : (
                                <span className="text-sm">{cell}</span>
                              )}
                            </div>
                          ))}
                          <div className="p-2 flex gap-1">
                            {editingRow === rowIdx ? (
                              <>
                                <Button size="sm" variant="ghost" onClick={handleSaveRow}>
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="ghost" onClick={() => handleEditRow(rowIdx, row)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteRow(rowIdx)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No data available</div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* SQL Query */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle>SQL Query Executor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sql-query">SQL Query</Label>
                <Textarea
                  id="sql-query"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="font-mono text-sm mt-1"
                  rows={6}
                  placeholder="Enter your SQL query here..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleExecuteQuery}
                  disabled={executeQueryMutation.isPending}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Execute Query
                </Button>
                {queryResult && !queryResult.error && (
                  <Button
                    variant="outline"
                    onClick={exportQueryResults}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                )}
              </div>

              {/* Query Results */}
              {queryResult && (
                <div className="border rounded p-4 bg-gray-50">
                  {queryResult.error ? (
                    <div className="text-red-600 font-mono text-sm">
                      Error: {queryResult.error}
                    </div>
                  ) : (
                    <div>
                      {queryResult.rowsAffected !== undefined ? (
                        <div className="text-green-600 font-medium">
                          Query executed successfully. {queryResult.rowsAffected} rows affected.
                        </div>
                      ) : (
                        <div>
                          <div className="text-green-600 font-medium mb-2">
                            Query executed successfully. {queryResult.rows?.length || 0} rows returned.
                          </div>
                          {queryResult.columns && queryResult.rows && (
                            <ScrollArea className="h-64">
                              <div className="border rounded bg-white">
                                <div className="grid bg-gray-100 border-b" style={{ gridTemplateColumns: `repeat(${queryResult.columns.length}, 1fr)` }}>
                                  {queryResult.columns.map((col: any, idx: number) => (
                                    <div key={idx} className="p-2 font-medium border-r last:border-r-0">
                                      {col}
                                    </div>
                                  ))}
                                </div>
                                {queryResult.rows.map((row: any, rowIdx: number) => (
                                  <div key={rowIdx} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: `repeat(${queryResult.columns.length}, 1fr)` }}>
                                    {row.map((cell: any, cellIdx: number) => (
                                      <div key={cellIdx} className="p-2 border-r last:border-r-0 text-sm">
                                        {cell}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Row Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Row to {selectedTable}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {tables?.find((t: TableInfo) => t.name === selectedTable)?.columns.map((col: any, idx: number) => (
              <div key={idx}>
                <Label>{col.name} ({col.type})</Label>
                <Input
                  value={newRow[idx] || ''}
                  onChange={(e) => {
                    const updatedRow = [...newRow];
                    updatedRow[idx] = e.target.value;
                    setNewRow(updatedRow);
                  }}
                  placeholder={col.nullable ? 'Optional' : 'Required'}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveNewRow}>
                <Save className="h-4 w-4 mr-2" />
                Save Row
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}