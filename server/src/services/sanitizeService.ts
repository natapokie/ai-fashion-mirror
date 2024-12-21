// import ChatCompletionResponseMessage from "openai"
// import ChatCompletionRequestMessage from "openai"

// Define a wrapper for the OpenAI ParsedChoice
type ParsedChoice<T> = {
  message: T;
};

// Define a ParsedChatCompletion type
type ParsedChatCompletion<T> = {
  choices: ParsedChoice<T>[];
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

// Define FullResponse using OpenAI message structure
type FullResponse = ParsedChatCompletion<{
  product_list: {
    image: string;
    name: string;
    feedback: string;
  }[];
}> & {
  _request_id?: string | null;
};

async function sanitizeProductList(full_response: FullResponse): Promise<FullResponse> {
  async function isValidImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'GET' });
      return response.ok;
    } catch (error) {
      console.error(`Error checking URL: ${url}`, error);
      return false;
    }
  }

  const sanitizedProductList = await Promise.all(
    full_response.choices[0].message.product_list.map(async (product) => {
      const isValid = await isValidImageUrl(product.image);
      return isValid ? product : null;
    }),
  );

  return {
    ...full_response,
    choices: [
      {
        message: {
          ...full_response.choices[0].message,
          product_list: sanitizedProductList.filter((product) => product !== null) as {
            image: string;
            name: string;
            feedback: string;
          }[],
        },
      },
    ],
  };
}

export default sanitizeProductList;

/*
async function sanitizeProductList(full_response: {
    product_list: {
        image: string;
        name: string;
        feedback: string;
    }[];
    _request_id?: string | null;
}): Promise<typeof full_response> {

async function isValidImageUrl(url: string): Promise<boolean> {
        try {
            const response = await fetch(url, { method: "GET" });
            return response.ok; 
        } catch (error) {
            // console.error(`Error checking URL: ${url}`, error);
            return false;
        }
    }

    const sanitizedProductList = await Promise.all(
        full_response.product_list.map(async (product) => {
            const isValid = await isValidImageUrl(product.image);
            return isValid ? product : null;
        })
    );

    return {
        ...full_response,
        product_list: sanitizedProductList.filter((product) => product !== null),
    };
}

*/
