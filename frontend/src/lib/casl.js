import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export const defineAbilitiesFor = (user) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (!user) {
    return build();
  }

  if (user.role === 'ADMIN') {
    // Admin can do everything
    can('manage', 'all');
  } else if (user.role === 'OWNER') {
    // Owner permissions
    can('read', 'User', { id: user.id });
    can('update', 'User', { id: user.id });
    
    // Owner can manage their own books
    can('create', 'Book');
    can('read', 'Book', { owner_id: user.owner_id });
    can('update', 'Book', { owner_id: user.owner_id });
    can('delete', 'Book', { owner_id: user.owner_id });
    
    // Owner can read their own data
    can('read', 'Owner', { id: user.owner_id });
    can('update', 'Owner', { id: user.owner_id });
    
    // Owner can read their wallet
    can('read', 'Wallet', { owner_id: user.owner_id });
    
    // Owner can read their rentals
    can('read', 'Rental', { owner_id: user.owner_id });
    
    // Owner can read categories
    can('read', 'Category');
    
    // Cannot access other owners' data
    cannot('read', 'Owner', { id: { $ne: user.owner_id } });
    cannot('read', 'Book', { owner_id: { $ne: user.owner_id } });
    cannot('read', 'Wallet', { owner_id: { $ne: user.owner_id } });
    
  } else if (user.role === 'USER') {
    // User permissions
    can('read', 'User', { id: user.id });
    can('update', 'User', { id: user.id });
    
    // User can read approved books from approved owners
    can('read', 'Book', { is_approved: true });
    
    // User can create rentals
    can('create', 'Rental');
    can('read', 'Rental', { user_id: user.id });
    can('update', 'Rental', { user_id: user.id });
    
    // User can read categories
    can('read', 'Category');
  }

  return build();
};

export const checkPermission = (ability, action, subject, field) => {
  return ability.can(action, subject, field);
};