import React, { useState } from "react";
import {
  Text,
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
} from "react-native";
import * as Yup from "yup";
import { useFormik } from "formik";
import tw from "twrnc";

import Button from "../../../components/button";
import Input from "../../../components/input";
import API_URL, { sendRequest } from "../../../config/api";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [tokenValueDays, setTokenValueDays] = useState("");
  const [hasFinishedToFetchData, setHasFinishedToFetchData] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [hasFinishedToFetchTokens, setHasFinishedToFetchTokens] =
    useState(false);

  const fields = [
    {
      placeholder: "Meter Number",
      value: "meter_number",
      secure: false,
      type: "number-pad",
    },
    {
      placeholder: "Amount",
      value: "amount",
      type: "number-pad",
      secure: false,
    },
  ];

  const initialValues = fields.reduce((acc, field) => {
    acc[field.value] = "";
    return acc;
  }, {});

  const validationSchema = Yup.object().shape({
    meter_number: Yup.string()
      .required("Meter number is required")
      .length(6, "Meter number must be exactly 6 digits"),
    amount: Yup.number()
      .min(100, "Amount less than 100 is not allowed")
      .required("Amount is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  const {
    handleChange,
    handleBlur,
    handleSubmit: formikHandleSubmit,
    values,
    errors,
    touched,
    resetForm,
  } = formik;

  const handleOnPress = async () => {
    console.log("The meter_number being sent", values.meter_number);
    setError("");

    try {
      const res = await sendRequest(
        API_URL + `/tokens/${values.meter_number}`,
        "GET"
      );

      if (res?.data?.status == 200) {
        setHasFinishedToFetchTokens(true);
        console.log("res.data.data", res?.data?.data);
        setTokens(res?.data?.data || []);
      } else {
        setError(
          res?.data?.message || "Error occurred while searching for tokens"
        );
      }
    } catch (error) {
      setError(error?.response?.data?.message || "An error occurred");
      console.log("error", error);
    }
    setLoading(false);
  };

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const response = await sendRequest(
        API_URL + "/tokens/buy",
        "POST",
        values
      );
      if (response?.data?.status == 200) {
        setLoading(false);

        console.log("Response data", response?.data);

        setHasFinishedToFetchData(true);

        setToken(response?.data?.data?.token);
        setTokenValueDays(response?.data?.data?.token_value_days);
        resetForm();
      } else {
        setError(
          response?.data?.message || "Error occurred while buying power"
        );
      }
    } catch (error) {
      setError(error?.response?.data?.message || "An error occurred");
      console.log("error", error);
    }
    setLoading(false);
  }

  return (
    <View style={tw`h-[100%] bg-white justify-end items-center`}>
      <SafeAreaView style={tw`h-[85%] w-full bg-white`}>
        <ScrollView>
          <View>
            <View style={tw`w-full`}>
              <Text
                style={tw`text-[#223458] text-center font-extrabold text-xl`}
              >
                Buy Energy
              </Text>
            </View>

            {error.length > 0 && (
              <Text style={tw`mt-4 text-red-500 text-center`}>{error}</Text>
            )}
            <View style={tw`mt-8`}>
              <View style={tw`px-6 py-2`}>
                {fields.map((field, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {}}
                    activeOpacity={0.8}
                  >
                    <Input
                      Icon={field.icon}
                      placeholder={field.placeholder}
                      onChangeText={handleChange(field.value)}
                      onBlur={handleBlur(field.value)}
                      value={values[field.value]}
                      security={field.secure}
                      type={field?.type}
                      borderColor={
                        touched[field.value] && errors[field.value]
                          ? "red"
                          : "gray"
                      }
                    />
                    {touched[field.value] && errors[field.value] && (
                      <Text style={tw`text-red-500`}>
                        {errors[field.value]}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}

                <View style={tw`mt-8`}>
                  <Button
                    mode={"contained"}
                    style={tw`w-full p-[10] mt-4`}
                    onPress={formikHandleSubmit}
                  >
                    {loading ? "Buying..." : "Buy"}
                  </Button>
                </View>

                <View>
                  <Text
                    style={tw`text-[#223458] text-center font-extrabold text-xl`}
                  >
                    {hasFinishedToFetchData && `Your token is ${token}`}
                  </Text>
                  <Text
                    style={tw`text-[#223458] text-center font-extrabold text-xl`}
                  >
                    {hasFinishedToFetchData &&
                      `Lighting Days ${tokenValueDays}`}
                  </Text>
                </View>

                <Button
                  mode={"contained"}
                  style={tw`w-full p-[5]`}
                  onPress={handleOnPress}
                >
                  {loading ? "Getting tokens..." : "Get tokens"}
                </Button>
              </View>

              <View>
                {hasFinishedToFetchTokens && tokens.length == 0 ? (
                  <Text>No tokens found</Text>
                ) : (
                  tokens.map((token, index) => (
                    <Text key={index}>{token?.token}</Text>
                  ))
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Home;
