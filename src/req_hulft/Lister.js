import { withStyles } from "@material-ui/core/styles";
import React from "react";
import { Datagrid, Filter, List, TextField, TextInput } from "react-admin";

const GlobalCss = withStyles({
  "@global": {
    ".MuiTableSortLabel-root.MuiTableSortLabel-active": {
      color: "white"
    },
    ".MuiTableSortLabel-root.MuiTableSortLabel-active.MuiTableSortLabel-root.MuiTableSortLabel-active .MuiTableSortLabel-icon": {
      color: "rgba(255, 255, 255, 0.54)"
    }
  }
})(() => null);

const ResourceFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Ids" source="id" alwaysOn />
    <TextInput label="Name" source="name" alwaysOn />
  </Filter>
);

const Lister = (props) => {
  return (
    <List {...props} filters={<ResourceFilter />}>
      <Datagrid rowClick="edit">
        <GlobalCss />
        <TextField key="sysname" source="sysname" />
        <TextField key="dept" source="dept" />
        <TextField key="name" source="name" />
        <TextField key="cat" source="cat" />
        <TextField key="hostname" source="hostname" />
        <TextField key="type" source="type" />
      </Datagrid>
    </List>
  );
};

export default Lister;
