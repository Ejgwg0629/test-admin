import React from "react";
import { Edit, ReferenceInput, SelectInput, SimpleForm, TextInput } from "react-admin";

var arrayFormat = (value, name) => {
  console.log(
    `format name: ${name}, isArray: ${Array.isArray(
      value
    )}, typeof: ${typeof value}, value: ${value}`
  );
  console.log(value);
  if (value) {
    return JSON.parse(value);
  }
  return;
};

var arrayParse = (value, name) => {
  console.log(
    `parse name: ${name}, isArray: ${Array.isArray(
      value
    )}, typeof: ${typeof value}, value: ${value}`
  );
  console.log(value);
  return JSON.stringify(value);
};

const Editor = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput label="名前" source="name" />
      <TextInput label="申請内容" source="type" />
      <SelectInput
        label="cat"
        source="cat"
        choices={[
          { id: "登録", name: "登録" },
          { id: "削除", name: "削除" },
          { id: "変更", name: "変更" }
        ]}
      />
      <ReferenceInput label="hostname" source="hostname" reference="cmdb_host_with_id">
        <SelectInput optionText="hostname_jp" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export default Editor;
