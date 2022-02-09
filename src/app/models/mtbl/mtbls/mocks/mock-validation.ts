

export const successfulValidation = {
    status: "success",
    timing: 1.23,
    validations: [
        {
            section: 'basic',
            details: [
                {
                  message: "Successfully read the investigation file",
                  section: "basic",
                  val_sequence: "basic_2",
                  status: "success",
                  metadata_file: "i_Investigation.txt",
                  value: "",
                  description: "",
                  val_override: "false",
                  val_message: ""
                },
                {
                  message: "Successfully read the study section of the investigation file",
                  section: "basic",
                  val_sequence: "basic_3",
                  status: "success",
                  metadata_file: "i_Investigation.txt",
                  value: "",
                  description: "",
                  val_override: "false",
                  val_message: ""
                },
                {
                  message: "Successfully found the reference to the sample sheet filename",
                  section: "basic",
                  val_sequence: "basic_5",
                  status: "success",
                  metadata_file: "i_Investigation.txt",
                  value: "",
                  description: "",
                  val_override: "false",
                  val_message: ""
                },
                {
                  message: "Successfully found one or more samples",
                  section: "basic",
                  val_sequence: "basic_10",
                  status: "success",
                  metadata_file: "s_MTBLS1898.txt",
                  value: "",
                  description: "",
                  val_override: "false",
                  val_message: ""
                },
                {
                  message: "Successfully found one or more assays",
                  section: "basic",
                  val_sequence: "basic_12",
                  status: "success",
                  metadata_file: "s_MTBLS1898.txt",
                  value: "",
                  description: "",
                  val_override: "false",
                  val_message: ""
                },
                {
                  message: "Successfully found one or more factors",
                  section: "basic",
                  val_sequence: "basic_14",
                  status: "success",
                  metadata_file: "s_MTBLS1898.txt",
                  value: "",
                  description: "",
                  val_override: "false",
                  val_message: ""
                },
                {
                  message: "Successfully found one or more descriptors",
                  section: "basic",
                  val_sequence: "basic_16",
                  status: "success",
                  metadata_file: "s_MTBLS1898.txt",
                  value: "",
                  description: "",
                  val_override: "false",
                  val_message: ""
                }
              ],
              message: "Successful validation",
              status: "success"
            },
    ]
}

export const failedValidation = {
    status: "error",
    timing: 1.23,
    validations: [
        {
            section: 'basic',
            details: [
                {
                  message: "Successfully read the investigation file",
                  section: "basic",
                  val_sequence: "basic_2",
                  status: "success",
                  metadata_file: "i_Investigation.txt",
                  value: "",
                  description: "The investigation file keeps many secrets from the eyes and ears of men.",
                  val_override: "false",
                  val_message: ""
                },
                {
                  message: "Successfully read the study section of the investigation file",
                  section: "basic",
                  val_sequence: "basic_3",
                  status: "success",
                  metadata_file: "i_Investigation.txt",
                  value: "",
                  description: "",
                  val_override: "false",
                  val_message: ""
                },
                {
                  message: "Successfully found the reference to the sample sheet filename",
                  section: "basic",
                  val_sequence: "basic_5",
                  status: "success",
                  metadata_file: "i_Investigation.txt",
                  value: "",
                  description: "",
                  val_override: "false",
                  val_message: ""
                },
                {
                  message: "Successfully found one or more samples",
                  section: "basic",
                  val_sequence: "basic_10",
                  status: "success",
                  metadata_file: "s_MTBLS1898.txt",
                  value: "",
                  description: "",
                  val_override: "false",
                  val_message: ""
                },
                {
                  message: "Successfully found one or more assays",
                  section: "basic",
                  val_sequence: "basic_12",
                  status: "success",
                  metadata_file: "s_MTBLS1898.txt",
                  value: "",
                  description: "",
                  val_override: "false",
                  val_message: ""
                },
                {
                  message: "Maybe found one or more factors",
                  section: "basic",
                  val_sequence: "basic_14",
                  status: "warning",
                  metadata_file: "s_MTBLS1898.txt",
                  value: "",
                  description: "",
                  val_override: "false",
                  val_message: ""
                },
                {
                  message: "File 'QC1_NEG.raw' is missing or not correct for column 'Raw Spectral Data File' (a_MTBLS2411_LC-MS_negative_reverse-phase_metabolite_profiling.txt)",
                  section: "basic",
                  val_sequence: "basic_16",
                  status: "error",
                  metadata_file: "s_MTBLS1898.txt",
                  value: "",
                  description: "File 'QC1_NEG.raw' does not exist (a_MTBLS2411_LC-MS_negative_reverse-phase_metabolite_profiling.txt)",
                  val_override: "false",
                  val_message: "",
                  comment: "Grabaogoli"
                },
                {
                  message: "File 'QC1_NEG.raw' is missing or not correct for column 'Raw Spectral Data File' (a_MTBLS2411_LC-MS_negative_reverse-phase_metabolite_profiling.txt)",
                  section: "basic",
                  val_sequence: "basic_17",
                  status: "error",
                  metadata_file: "s_MTBLS1898.txt",
                  value: "",
                  description: "File 'QC1_NEG.raw' does not exist (a_MTBLS2411_LC-MS_negative_reverse-phase_metabolite_profiling.txt)",
                  val_override: "false",
                  val_message: "",
                  comment: "Grabaogoli"
                }
              ],
              message: "Unsuccessful validation",
              status: "error"
            },
    ]
}