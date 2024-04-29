const deleteAllVnets = async (displayName: string) => {
    if (!displayName.length) {
      throw new Error('A display name is required for the virtual testnet');
    }
  
    const res = await fetch(
      `https://api.tenderly.co/api/v1/makerdao/testnets?displayName=${displayName}&projectOwner=jetstreamgg`,
      {
        headers: [['X-Access-Key', `${process.env.TENDERLY_API_KEY}`]],
        method: 'GET'
      }
    );
  
    const data = await res.json();
  
    (data as any[]).map(async vnet => {
      // Prevent deletion of other testnets and teams.
      // double check before deleting but the query should be specific enough as is
      const createdAt = new Date(vnet.createdAt);
      const AGE = 30; // in minutes
      const pastTime = new Date(Date.now() - AGE * 60000);
      const isOldEnough = createdAt.getTime() <= pastTime.getTime();
  
      if (
        vnet.displayName === displayName &&
        vnet.metadata.project_owner_name === 'jetstreamgg' &&
        isOldEnough
      ) {
        console.log(`Deleting Virtual Testnet with ID ${vnet.id}`);
        //
        // IMPORTANT: Uncomment the following code to delete the virtual testnet
        //
        const response = await fetch(
          `https://api.tenderly.co/api/v1/account/jetstreamgg/project/jetstream/testnet/container/${vnet.id}`,
          {
            headers: [['X-Access-Key', `${process.env.TENDERLY_API_KEY}`]],
            method: 'DELETE'
          }
        );
        if (response.status === 204) {
          console.log(`Virtual Testnet with ID ${vnet.id} and name ${vnet.displayName} successfully deleted`);
        } else {
          console.log(`There was an error while deleting the virtual testnet with ID ${vnet.id}`);
        }
      }
    });
  };
  
  const displayName = process.argv[2];
  deleteAllVnets(displayName);
  